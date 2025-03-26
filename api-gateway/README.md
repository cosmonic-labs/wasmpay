# Api Gateway

The entrypoint for the wasmpay application. This component serves static web assets for the frontend as well as serving as an API gateway for all backend requests.

## Configuration

This component supports configuration via `wasi:config/runtime` at runtime.

| Setting            | Description                                | Default Value           |
| ------------------ | ------------------------------------------ | ----------------------- |
| `bank_backend_url` | The URL to send ledger backend requests to | `http://127.0.0.1:8080` |
