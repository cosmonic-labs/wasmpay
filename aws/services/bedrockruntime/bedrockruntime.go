package bedrockruntime

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/cosmonic-labs/wasmpay/aws"
	v4 "github.com/cosmonic-labs/wasmpay/aws/signer/v4"
	"go.wasmcloud.dev/component/log/wasilog"
)

const (
	contentTypeJSON = "application/json"
	serviceName     = "bedrock"
)

var (
	ErrMissingBody        = errors.New("bedrockruntime: Body was not provided")
	ErrInvalidContentType = errors.New("bedrockruntime: ContenType must be set to 'application/json'")
	ErrMissingModelId     = errors.New("bedrockruntime: ModelId was not provided")
	ErrFailedToReadFull   = errors.New("bedrockruntime: Failed to read all bytes")
)

type Client struct {
	cfg aws.Config
}

type InvokeModelInput struct {
	ModelId     string
	Body        []byte
	ContentType string
}

type InvokeModelOutput struct {
	Body        []byte
	ContentType string
}

func NewFromConfig(cfg aws.Config) *Client {
	return &Client{
		cfg: cfg,
	}
}

// https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html
func (c *Client) InvokeModel(ctx context.Context, params *InvokeModelInput) (*InvokeModelOutput, error) {
	logger := wasilog.ContextLogger("aws/services/bedrockruntime")
	if err := c.validate(params); err != nil {
		logger.Error("failed to validate InvokeModel params", "error", err)
		return nil, err
	}

	u := c.baseURL()
	u.Path = params.invokePath()

	input := bytes.NewBuffer(params.Body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.String(), input)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Accept", contentTypeJSON)
	req.Header.Set("Content-Type", params.ContentType)
	resp, err := c.sendRequest(req)
	if err != nil {
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

	output := &InvokeModelOutput{
		Body:        out.Bytes(),
		ContentType: resp.Header.Get("Content-Type"),
	}

	return output, nil
}

// https://docs.aws.amazon.com/general/latest/gr/bedrock.html#br-rt
func (c *Client) baseURL() *url.URL {
	return &url.URL{
		Scheme: "https",
		Host:   fmt.Sprintf("bedrock-runtime.%s.amazonaws.com", c.cfg.Region),
	}
}

func (c *Client) sendRequest(req *http.Request) (*http.Response, error) {
	ctx := context.Background()

	signer := v4.NewSigner()
	credentials, err := c.cfg.CredentialsProvider.Retrieve(ctx)
	if err != nil {
		return nil, err
	}

	// Calculate the payload hash from request body
	h := sha256.New()
	_, _ = io.Copy(h, req.Body)
	payloadHash := hex.EncodeToString(h.Sum(nil))

	err = signer.SignHTTP(ctx, credentials, req, payloadHash, serviceName, c.cfg.Region, time.Now().UTC())
	if err != nil {
		return nil, err
	}

	resp, err := c.cfg.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (c *Client) validate(params *InvokeModelInput) error {
	if params.ContentType != contentTypeJSON {
		return ErrInvalidContentType
	}
	if params.ModelId == "" {
		return ErrMissingModelId
	}
	if len(params.Body) == 0 {
		return ErrMissingBody
	}
	return nil
}

func (im *InvokeModelInput) invokePath() string {
	return fmt.Sprintf("/model/%s/invoke", url.QueryEscape(im.ModelId))
}
