# Makefile with auto-updating help

.PHONY: help build

WASMCLOUD_EXPERIMENTAL_FEATURES = builtin-messaging-nats,builtin-http-server 

help:
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {printf "  %-10s - %sn", $$1, $$2}' $(MAKEFILE_LIST)

build: build-ui ## Build all components in the project
	wash build -p api-gateway
	wash build -p wasmpay-platform-harness
	wash build -p icamer-validator
	wash build -p nordhaven-validator
	wash build -p transaction-manager
	wash build -p untrusted-validator
	wash build -p wasmpay-validator

build-ui: ## Build the UI
	npm i
	npm run build

test-e2e: build ## Build all components and deploy the local wadm
	@WASMCLOUD_EXPERIMENTAL_FEATURES=${WASMCLOUD_EXPERIMENTAL_FEATURES} \
		wash up -d
	@sleep 1
	@wash app deploy ./app.wadm.yaml
	@until wash app get | grep wasmpay | tee /dev/stderr | grep Deployed; do sleep 1; done
	@make test-validate
	@wash down --all

test-validate: ## curl the API gateway with a test validation that should succeed after deploy
	curl localhost:8000/api/v1/transactions -d '{"origin": {"id": "bank1", "code": "nordhaven", "country": "USA", "currency": "USD", "name": "Bank One"}, "destination": {"id": "icamer", "code": "icamer", "country": "GBR", "currency": "GBP", "name": "Bank Two"}, "amount": 1000, "currency": "USD", "status": "Approved"}'

test-validate-invalid: ## curl the API gateway with a test validation that should fail after deploy
		curl localhost:8000/api/v1/transactions -d '{"origin": {"id": "bank1", "code": "nordhaven", "country": "USA", "currency": "USD", "name": "Bank One"}, "destination": {"id": "icamer", "code": "icamer", "country": "GBR", "currency": "GBP", "name": "Bank Two"}, "amount": 1000, "currency": "GBP", "status": "Approved"}'

test-scale: ## Run a single validator 10000 times, then invoke them all
	nats-server -js -c ./hack/scale.conf &
	WASMCLOUD_EXPERIMENTAL_FEATURES=${WASMCLOUD_EXPERIMENTAL_FEATURES} \
		wash up -d --nats-connect-only
	sleep 10
	wash config put httphost routing_mode=host default_address=0.0.0.0:8001
	wash start provider ghcr.io/wasmcloud/http-server:0.27.0 http --config httphost
	./hack/scale.sh
