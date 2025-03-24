package credentials

import (
	"context"
	"errors"

	"github.com/cosmonic-labs/wasmpay/aws"
)

var ErrEmptyCredentials = errors.New("credentials: static credentials are empty")

type StaticCredentialsProvider struct {
	Value aws.Credentials
}

func NewStaticCredentialsProvider(key, secret, session string) StaticCredentialsProvider {
	return StaticCredentialsProvider{
		Value: aws.Credentials{
			AccessKeyID:     key,
			SecretAccessKey: secret,
			SessionToken:    session,
		},
	}
}

func (s StaticCredentialsProvider) Retrieve(_ context.Context) (aws.Credentials, error) {
	v := s.Value
	if v.AccessKeyID == "" || v.SecretAccessKey == "" {
		return aws.Credentials{}, ErrEmptyCredentials
	}

	return v, nil
}
