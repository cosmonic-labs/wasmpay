module github.com/cosmonic-labs/wasmpay/api-gateway

go 1.24.0

require (
	github.com/cosmonic-labs/wasmpay/aws v0.0.0
	github.com/cosmonic-labs/wasmpay/aws/config v0.0.0
	github.com/cosmonic-labs/wasmpay/aws/services/bedrockruntime v0.0.0
	github.com/cosmonic-labs/wasmpay/aws/services/sts v0.0.0
	github.com/julienschmidt/httprouter v1.3.0
	go.bytecodealliance.org/cm v0.1.0
	go.wasmcloud.dev/component v0.0.6
	golang.org/x/oauth2 v0.24.0
)

replace (
	github.com/cosmonic-labs/wasmpay v0.0.0 => ../
	github.com/cosmonic-labs/wasmpay/aws v0.0.0 => ../aws
	github.com/cosmonic-labs/wasmpay/aws/config v0.0.0 => ../aws/config
	github.com/cosmonic-labs/wasmpay/aws/services/bedrockruntime v0.0.0 => ../aws/services/bedrockruntime
	github.com/cosmonic-labs/wasmpay/aws/services/sts v0.0.0 => ../aws/services/sts
)

require (
	github.com/google/go-cmp v0.6.0 // indirect
	github.com/samber/lo v1.49.1 // indirect
	github.com/samber/slog-common v0.18.1 // indirect
	golang.org/x/text v0.22.0 // indirect
)
