package config

import (
	"context"
	"net/http"

	"github.com/cosmonic-labs/wasmpay/aws"
	"github.com/cosmonic-labs/wasmpay/aws/credentials"
)

type loadOptions struct {
	CredentialsProvider aws.CredentialsProvider
	HTTPClient          *http.Client
	Region              string
}

func LoadDefaultConfig(ctx context.Context, opts ...func(*loadOptions) error) (aws.Config, error) {
	loadOpts := defaultLoadOptions()

	for _, opt := range opts {
		if err := opt(loadOpts); err != nil {
			return aws.Config{}, err
		}
	}

	return aws.Config{
		Region:              loadOpts.Region,
		HTTPClient:          loadOpts.HTTPClient,
		CredentialsProvider: loadOpts.CredentialsProvider,
	}, nil
}

func WithCredentialsProvider(v aws.CredentialsProvider) func(*loadOptions) error {
	return func(lo *loadOptions) error {
		lo.CredentialsProvider = v
		return nil
	}
}

func WithHTTPClient(v *http.Client) func(*loadOptions) error {
	return func(lo *loadOptions) error {
		lo.HTTPClient = v
		return nil
	}
}

func WithRegion(v string) func(*loadOptions) error {
	return func(lo *loadOptions) error {
		lo.Region = v
		return nil
	}
}

func defaultLoadOptions() *loadOptions {
	return &loadOptions{
		Region:              "us-east-2",
		HTTPClient:          &http.Client{},
		CredentialsProvider: credentials.StaticCredentialsProvider{},
	}
}
