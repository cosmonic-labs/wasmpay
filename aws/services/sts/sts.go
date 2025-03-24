package sts

import (
	"bufio"
	"bytes"
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/cosmonic-labs/wasmpay/aws"
	"go.wasmcloud.dev/component/log/wasilog"
)

const (
	serviceAPIVersion      = "2011-06-15"
	defaultDurationSeconds = 3600
	minDurationSeconds     = 900
	maxDurationSeconds     = 43200
)

var (
	ErrMissingRoleArn          = errors.New("sts: RoleArn was not provided")
	ErrMissingRoleSessionName  = errors.New("sts: RoleSessionName was not provided")
	ErrMissingWebIdentityToken = errors.New("sts: WebIdentityToken was not provided")
	ErrFailedToReadFull        = errors.New("sts: Failed to read all bytes")
)

type Client struct {
	cfg aws.Config
}

// https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html#API_AssumeRoleWithWebIdentity_RequestParameters
type AssumeRoleWithWebIdentityInput struct {
	RoleArn          string
	RoleSessionName  string
	DurationSeconds  int
	WebIdentityToken string
}

// https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html#API_AssumeRoleWithWebIdentity_ResponseElements
type AssumeRoleWithWebIdentityOutput struct {
	Audience    string
	Credentials Credentials
}

type Credentials struct {
	AccessKeyID     string
	Expiration      time.Time
	SecretAccessKey string
	SessionToken    string
}

type ResultSuccess struct {
	XMLName         xml.Name  `xml:"AssumeRoleWithWebIdentityResponse"`
	Audience        string    `xml:"AssumeRoleWithWebIdentityResult>Audience"`
	AccessKeyId     string    `xml:"AssumeRoleWithWebIdentityResult>Credentials>AccessKeyId"`
	SecretAccessKey string    `xml:"AssumeRoleWithWebIdentityResult>Credentials>SecretAccessKey"`
	SessionToken    string    `xml:"AssumeRoleWithWebIdentityResult>Credentials>SessionToken"`
	Expiration      time.Time `xml:"AssumeRoleWithWebIdentityResult>Credentials>Expiration"`
}

type ResultError struct {
	XMLName xml.Name `xml:"ErrorResponse"`
	Message string   `xml:"Error>Message"`
}

func NewFromConfig(cfg aws.Config) *Client {
	return &Client{
		cfg: cfg,
	}
}

// https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html
func (c *Client) AssumeRoleWithWebIdentity(ctx context.Context, params *AssumeRoleWithWebIdentityInput) (*AssumeRoleWithWebIdentityOutput, error) {
	logger := wasilog.ContextLogger("aws/services/sts")

	if err := c.validate(params); err != nil {
		logger.Error("failed to validate AssumeRoleWithWebIdentity params", "error", err)
		return nil, err
	}

	query := params.asQueryParams()
	query.Add("Action", "AssumeRoleWithWebIdentity")
	query.Add("Version", serviceAPIVersion)

	u := c.baseURL()
	u.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.String(), nil)
	if err != nil {
		logger.Error("failed to create new request", "error", err)
		return nil, err
	}

	resp, err := c.sendRequest(req)
	if err != nil {
		logger.Error("failed to send request", "error", err)
		return nil, err
	}
	defer resp.Body.Close()

	var out bytes.Buffer
	outBuf := bufio.NewWriter(&out)
	buf := make([]byte, 4096)
	_, err = io.CopyBuffer(outBuf, resp.Body, buf)
	if err != nil {
		logger.Error("failed to copy response", "error", err)
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		var res ResultError
		err = xml.Unmarshal(out.Bytes(), &res)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal response: %w", err)
		}
		return nil, errors.New(res.Message)
	}

	var res ResultSuccess
	err = xml.Unmarshal(out.Bytes(), &res)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &AssumeRoleWithWebIdentityOutput{
		Audience: res.Audience,
		Credentials: Credentials{
			AccessKeyID:     res.AccessKeyId,
			SecretAccessKey: res.SecretAccessKey,
			SessionToken:    res.SessionToken,
			Expiration:      res.Expiration,
		},
	}, nil
}

// https://docs.aws.amazon.com/general/latest/gr/sts.html#sts_region
func (c *Client) baseURL() *url.URL {
	return &url.URL{
		Scheme: "https",
		Host:   fmt.Sprintf("sts.%s.amazonaws.com", c.cfg.Region),
	}
}

func (c *Client) sendRequest(req *http.Request) (*http.Response, error) {
	resp, err := c.cfg.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (c *Client) validate(params *AssumeRoleWithWebIdentityInput) error {
	if params.RoleArn == "" {
		return ErrMissingRoleArn
	}
	if params.RoleSessionName == "" {
		return ErrMissingRoleSessionName
	}
	if params.WebIdentityToken == "" {
		return ErrMissingWebIdentityToken
	}
	return nil
}

func (input *AssumeRoleWithWebIdentityInput) asQueryParams() url.Values {
	query := url.Values{}
	query.Add("RoleArn", input.RoleArn)
	query.Add("RoleSessionName", input.RoleSessionName)
	query.Add("WebIdentityToken", input.WebIdentityToken)

	durationSeconds := input.DurationSeconds
	if durationSeconds == 0 {
		// If zero value, set to default value (3600)
		durationSeconds = defaultDurationSeconds
	} else if durationSeconds < minDurationSeconds {
		// If less than minimum value, set to minimum value (900)
		durationSeconds = minDurationSeconds
	} else if durationSeconds > maxDurationSeconds {
		// If more than maximum allowed value, set to maximum value (43200)
		durationSeconds = maxDurationSeconds
	}
	query.Add("DurationSeconds", strconv.Itoa(durationSeconds))

	return query
}
