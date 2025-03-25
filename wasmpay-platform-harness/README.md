# Wasmpay Platform Harness

This component is built to compose with any component that `export`s the `wasmpay:platform/validation` interface. It implements a passthrough for the `validate` function enabling schema changes without recompiling the underlying component. It also provides the `wasi:http` and `wasmcloud:messaging` exports for simple testing of a validator component without the validator needing to implement the transport logic.
