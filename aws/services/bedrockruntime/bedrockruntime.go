package bedrockruntime

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/cosmonic-labs/wasmpay/aws"
	"github.com/cosmonic-labs/wasmpay/aws/services/bedrockruntime/types"
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
	ErrMissingMessages    = errors.New("bedrockruntime: No messages were provided")
	ErrMissingModelId     = errors.New("bedrockruntime: ModelId was not provided")
	ErrFailedToReadFull   = errors.New("bedrockruntime: Failed to read all bytes")
)

type Client struct {
	cfg aws.Config
}

// Minimal representation of https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/bedrockruntime#ConverseInput
type ConverseInput struct {
	// Specifies the model or throughput with which to run inference, or the prompt
	// resource to use in inference.
	ModelId string `json:"-"`

	// Inference parameters to pass to the model. Converse and ConverseStream support
	// a base set of inference parameters.
	InferenceConfig *types.InferenceConfiguration `json:"inference_config,omitempty"`

	// The messages that you want to send to the model.
	Messages []types.Message `json:"messages"`

	// A prompt that provides instructions or context to the model about the task it
	// should perform, or the persona it should adopt during the conversation.
	System []types.SystemContentBlock `json:"system,omitempty"`
}

// Minimal representation of https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/bedrockruntime#ConverseOutput
type ConverseOutput struct {
	Output types.ConverseOutputMemberMessage
}

// Minimal representation of https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/bedrockruntime#InvokeModelInput
type InvokeModelInput struct {
	ModelId     string
	Body        []byte
	ContentType string
}

// Minimal representation of https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/bedrockruntime#InvokeModelOutput
type InvokeModelOutput struct {
	Body        []byte
	ContentType string
}

func NewFromConfig(cfg aws.Config) *Client {
	return &Client{
		cfg: cfg,
	}
}

// https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html
func (c *Client) Converse(ctx context.Context, params *ConverseInput) (*ConverseOutput, error) {
	logger := wasilog.ContextLogger("aws/services/bedrockruntime/converse")
	if err := params.validate(); err != nil {
		logger.Error("failed to validate Converse params", "error", err)
		return nil, err
	}

	u := c.baseURL()
	u.Path = c.endpointPath(params)

	reqBytes, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}

	input := bytes.NewBuffer(reqBytes)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.String(), input)
	if err != nil {
		return nil, err
	}

	// req.Header.Set("Accept", contentTypeJSON)
	resp, err := c.sendRequest(req)
	if err != nil {
		logger.Error("failed to send Converse request", "error", err)
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

	var output ConverseOutput
	if err = json.Unmarshal(out.Bytes(), &output); err != nil {
		logger.Error("failed to unmarshal bedrock runtime response", "error", err)
		return nil, err
	}

	return &output, nil
}

// https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html
func (c *Client) InvokeModel(ctx context.Context, params *InvokeModelInput) (*InvokeModelOutput, error) {
	logger := wasilog.ContextLogger("aws/services/bedrockruntime/invoke-model")
	if err := params.validate(); err != nil {
		logger.Error("failed to validate InvokeModel params", "error", err)
		return nil, err
	}

	u := c.baseURL()
	u.Path = c.endpointPath(params)

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

func (c *Client) endpointPath(params any) string {
	switch v := params.(type) {
	case *ConverseInput:
		return fmt.Sprintf("/model/%s/converse", url.QueryEscape(v.ModelId))
	case *InvokeModelInput:
		return fmt.Sprintf("/model/%s/invoke", url.QueryEscape(v.ModelId))
	}
	return "/"
}

func (c *Client) sendRequest(req *http.Request) (*http.Response, error) {
	ctx := context.Background()

	signer := v4.NewSigner()
	credentials, err := c.cfg.CredentialsProvider.Retrieve(ctx)
	if err != nil {
		return nil, err
	}

	err = signer.SignHTTP(ctx, credentials, req, serviceName, c.cfg.Region, time.Now().UTC())
	if err != nil {
		return nil, err
	}

	resp, err := c.cfg.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (c *ConverseInput) validate() error {
	if c.ModelId == "" {
		return ErrMissingModelId
	}
	if len(c.Messages) == 0 {
		return ErrMissingMessages
	}
	return nil
}

func (im *InvokeModelInput) validate() error {
	if im.ContentType != contentTypeJSON {
		return ErrInvalidContentType
	}
	if im.ModelId == "" {
		return ErrMissingModelId
	}
	if len(im.Body) == 0 {
		return ErrMissingBody
	}
	return nil
}
