# wasmpay

Excalidraw: [https://app.excalidraw.com/s/8KJjWr92MgZ/jvEoVa1fXz](https://app.excalidraw.com/s/8KJjWr92MgZ/jvEoVa1fXz)

## Components

1. "Donut / platform harness" component [wasmpay-messaging](./wasmpay-messaging/) which handles `wasmcloud:messaging` messages and is meant to compose with bank-specific validators
1. The [nordhaven-validator](./nordhaven-validator/) component which implements `wasmpay:platform/validation` for a bank that only allows USD transactions
1. The [icamer-validator](./icamer-validator/) component which implements `wasmpay:platform/validation` for a bank that doesn't allow transactions
