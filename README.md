# wasmpay

Excalidraw: [https://app.excalidraw.com/s/8KJjWr92MgZ/jvEoVa1fXz](https://app.excalidraw.com/s/8KJjWr92MgZ/jvEoVa1fXz)

## Components

1. The [api-gateway](./api-gateway/) which fronts an HTTP API and serves static web assets for the wasmpay frontend
1. "Donut / platform harness" component [wasmpay-platform-harness](./wasmpay-platform-harness/) which provides the ability to invoke validators via `wasmcloud:messaging` or `wasi:http` and is meant to compose with bank-specific validators. This also virtualizes the `validation` handler for each component allowing for translation of APIs and build-time validation.
1. The [transaction-manager](./transaction-manager/) which is responsible for validating a transaction with the wasmpay platform and the origin/destination banks. If banks don't provide their own validator, it's assumed they will allow a transaction to go through.
1. The [wasmpay-validator](./wasmpay-validator/) component which implements `wasmpay:platform/validation` for extra runtime validation logic
1. The [nordhaven-validator](./nordhaven-validator/) component which implements `wasmpay:platform/validation` for a bank that only allows USD transactions
1. The [icamer-validator](./icamer-validator/) component which implements `wasmpay:platform/validation` for a bank that doesn't allow transactions
1. The [untrusted-validator](./untrusted-validator/) component which implements `wasmpay:platform/validation` as generated by an AI model and serves as a template for AI generated components deployed straight to Cosmonic
