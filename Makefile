# Makefile with auto-updating help

.PHONY: help build proto

WASMCLOUD_EXPERIMENTAL_FEATURES = builtin-messaging-nats,builtin-http-server 

help:
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z0-9_-]+:.*?## / {printf "  %-10s - %sn", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all components in the project
	@wash build -p api-gateway
	@wash build -p wasmpay-messaging
	@wash build -p icamer-validator
	@wash build -p nordhaven-validator
	@wash build -p transaction-manager
	@wash build -p untrusted-validator
	@wash build -p wasmpay-validator

proto: ## Generate protobuf definitions for the Ledger service
	go tool buf generate

test-e2e: build ## Build all components and deploy the local wadm
	@WASMCLOUD_EXPERIMENTAL_FEATURES=${WASMCLOUD_EXPERIMENTAL_FEATURES} \
		wash up -d
	@sleep 1
	@wash app deploy ./app.wadm.yaml
	@until wash app get | grep wasmpay | tee /dev/stderr | grep Deployed; do sleep 1; done
	@make test-validate
	@wash down --all

test-validate: ## curl the API gateway with a test validation that should work after deploy
	curl 127.0.0.1:8000/api/v1/transaction -d '{"id":"txn_123456","origin":{"id":"nordhaven","name":"First National Bank","country":"USA","currency":"USD"},"destination":{"id":"icamer","name":"Global Trust","country":"UK","currency":"GBP"},"amount":{"name":"USD","symbol":"$$","amount":10000},"status":"completed"}'
