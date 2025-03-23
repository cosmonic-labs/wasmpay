package aws

import (
	"context"
	"net/http"
	"time"
)

type Config struct {
	HTTPClient          *http.Client
	Region              string
	CredentialsProvider CredentialsProvider
}

type Credentials struct {
	AccessKeyID     string
	SecretAccessKey string
	SessionToken    string
	Expires         time.Time
}

type CredentialsProvider interface {
	Retrieve(context.Context) (Credentials, error)
}
