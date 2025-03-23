package signer

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"maps"
	"net/http"
	"net/url"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/cosmonic-labs/wasmpay/aws"
)

const (
	amzDateKey          = "X-Amz-Date"
	amzSecurityTokenKey = "X-Amz-Security-Token"
	awsRequest          = "aws4_request"
	contentLengthHeader = "content-length"
	dateTimeFormat      = "20060102T150405Z"
	hostHeader          = "host"
	shortDateFormat     = "20060102"
	signingAlgorithm    = "AWS4-HMAC-SHA256"
)

var ignoredHeaders = []string{"Authorization", "User-Agent", "X-Amzn-Trace-Id", "Expect", "Transfer-Encoding"}

type HTTPSigner interface {
	SignHTTP(ctx context.Context, credentials aws.Credentials, r *http.Request, payloadHash string, service string, region string, signingTime time.Time) error
}

type Signer struct{}

func NewSigner() *Signer {
	return &Signer{}
}

func (s Signer) SignHTTP(ctx context.Context, credentials aws.Credentials, r *http.Request, payloadHash string, service string, region string, signingTime time.Time) error {
	signer := &httpSigner{
		Request:     r,
		ServiceName: service,
		Region:      region,
		Time:        signingTime,
		Credentials: credentials,
		PayloadHash: payloadHash,
	}

	err := signer.Build()
	if err != nil {
		return err
	}
	return nil
}

type httpSigner struct {
	Request     *http.Request
	ServiceName string
	Region      string
	Time        time.Time
	Credentials aws.Credentials
	PayloadHash string
}

func (s *httpSigner) Build() error {
	req := s.Request
	query := req.URL.Query()
	headers := req.Header

	// Set required signing fields
	s.setRequiredSigningFields(headers, query)

	// Sort Each Query Key's Values
	for key := range query {
		sort.Strings(query[key])
	}

	// Sanitize host header
	req.Host = req.URL.Hostname()

	credentialScope := s.buildCredentialScope()
	credentialStr := s.Credentials.AccessKeyID + "/" + credentialScope

	host := req.URL.Host
	if len(req.Host) > 0 {
		host = req.Host
	}

	_, signedHeadersStr, canonicalHeaderStr := s.buildCanonicalHeaders(host, ignoredHeaders, headers, s.Request.ContentLength)

	var rawQuery strings.Builder
	rawQuery.WriteString(strings.Replace(query.Encode(), "+", "%20", -1))

	canonicalURI := s.getURIPath(req.URL)

	canonicalString := s.buildCanonicalString(
		req.Method,
		canonicalURI,
		rawQuery.String(),
		signedHeadersStr,
		canonicalHeaderStr,
	)

	stringtoSign := s.buildStringToSign(credentialScope, canonicalString)
	signingSignature := s.buildSignature(stringtoSign)

	headers.Set("Authorization", buildAuthorizationHeader(credentialStr, signedHeadersStr, signingSignature))

	req.URL.RawQuery = rawQuery.String()

	return nil
}

// set required signing fields for non-presigned requests
func (s *httpSigner) setRequiredSigningFields(headers http.Header, _ url.Values) {
	headers.Set(amzDateKey, s.amzDate())
	if s.Credentials.SessionToken != "" {
		headers.Set(amzSecurityTokenKey, s.Credentials.SessionToken)
	}
}

func (s *httpSigner) amzShortDate() string {
	return s.Time.Format(shortDateFormat)
}

func (s *httpSigner) amzDate() string {
	return s.Time.Format(dateTimeFormat)
}

func (s *httpSigner) buildCredentialScope() string {
	return strings.Join([]string{s.amzShortDate(), s.Region, s.ServiceName, awsRequest}, "/")
}

func (s *httpSigner) buildCanonicalHeaders(host string, ignoredHeaders []string, headers http.Header, contentLength int64) (http.Header, string, string) {
	signed := make(http.Header)

	signed[hostHeader] = append(signed[hostHeader], host)
	if contentLength > 0 {
		signed[contentLengthHeader] = append(signed[contentLengthHeader], strconv.FormatInt(contentLength, 10))
	}

	for k, v := range headers {
		if slices.Contains(ignoredHeaders, k) {
			continue
		}

		if strings.EqualFold(k, contentLengthHeader) {
			// prevent signing already handled content-length header.
			continue
		}

		lowerCaseKey := strings.ToLower(k)
		signed[lowerCaseKey] = v
	}

	headerKeys := slices.Collect(maps.Keys(signed))
	slices.Sort(headerKeys)
	signedHeaders := strings.Join(headerKeys, ";")

	var canonicalHeaders strings.Builder
	for i := 0; i < len(headerKeys); i++ {
		if headerKeys[i] == hostHeader {
			canonicalHeaders.WriteString(hostHeader)
			canonicalHeaders.WriteRune(':')
			canonicalHeaders.WriteString(strings.TrimSpace(host))
		} else {
			canonicalHeaders.WriteString(headerKeys[i])
			canonicalHeaders.WriteRune(':')
			values := signed[headerKeys[i]]
			for j, v := range values {
				cleanedValue := strings.TrimSpace(v)
				canonicalHeaders.WriteString(cleanedValue)
				if j < len(values)-1 {
					canonicalHeaders.WriteRune(',')
				}
			}
		}
		canonicalHeaders.WriteRune('\n')
	}

	return signed, signedHeaders, canonicalHeaders.String()
}

func (s *httpSigner) getURIPath(u *url.URL) string {
	var uriPath string

	if len(u.Opaque) > 0 {
		const schemeSep, pathSep, queryStart = "//", "/", "?"

		opaque := u.Opaque
		// Cut off the query string if present.
		if idx := strings.Index(opaque, queryStart); idx >= 0 {
			opaque = opaque[:idx]
		}

		// Cutout the scheme separator if present.
		if strings.Index(opaque, schemeSep) == 0 {
			opaque = opaque[len(schemeSep):]
		}

		// capture URI path starting with first path separator.
		if idx := strings.Index(opaque, pathSep); idx >= 0 {
			uriPath = opaque[idx:]
		}
	} else {
		uriPath = u.EscapedPath()
	}

	if len(uriPath) == 0 {
		uriPath = "/"
	}

	return uriPath
}

func (s *httpSigner) buildCanonicalString(method, uri, query, signedHeaders, canonicalHeaders string) string {
	return strings.Join([]string{
		method,
		uri,
		query,
		canonicalHeaders,
		signedHeaders,
		s.PayloadHash,
	}, "\n")
}

func (s *httpSigner) buildStringToSign(credentialScope, canonicalString string) string {
	hash := sha256.New()
	hash.Write([]byte(canonicalString))

	return strings.Join([]string{
		signingAlgorithm,
		s.amzDate(),
		credentialScope,
		hex.EncodeToString(hash.Sum(nil)),
	}, "\n")
}

func (s *httpSigner) buildSignature(stringToSign string) string {
	key := s.deriveSigningKey()
	return hex.EncodeToString(hmacSha256(key, []byte(stringToSign)))
}

func (s *httpSigner) deriveSigningKey() []byte {
	dateKey := hmacSha256([]byte("AWS4"+s.Credentials.SecretAccessKey), []byte(s.amzShortDate()))
	regionKey := hmacSha256(dateKey, []byte(s.Region))
	serviceKey := hmacSha256(regionKey, []byte(s.ServiceName))
	signingKey := hmacSha256(serviceKey, []byte(awsRequest))
	return signingKey
}

func buildAuthorizationHeader(credentialStr, signedHeaders, signature string) string {
	var builder strings.Builder
	builder.WriteString(signingAlgorithm)
	builder.WriteRune(' ')
	builder.WriteString("Credential=")
	builder.WriteString(credentialStr)
	builder.WriteString(", ")
	builder.WriteString("SignedHeaders=")
	builder.WriteString(signedHeaders)
	builder.WriteString(", ")
	builder.WriteString("Signature=")
	builder.WriteString(signature)

	return builder.String()
}

func hmacSha256(key, data []byte) []byte {
	hmac := hmac.New(sha256.New, []byte(key))
	hmac.Write([]byte(data))
	return hmac.Sum(nil)
}
