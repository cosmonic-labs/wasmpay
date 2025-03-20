# Banking Demo

TinyGo component that implements a CRUDdy bank application and OAuth2 integration with GitHub, and UI.

## Prerequisites

- `go`
- `tinygo`
- [`wash`](https://wasmcloud.com/docs/installation)
- `npm`

wasmCloud capability provider OCI images needed:

- `ghcr.io/wasmcloud/keyvalue-nats:0.3.1`
- `ghcr.io/wasmcloud/http-client:0.12.1`
- `ghcr.io/wasmcloud/http-server:0.24.0`
- `ghcr.io/brooksmtownsend/banking-demo:0.1.0` (if using the prebuilt component)

## Building

Make sure to replace the `client_secret` in [oauth.go](./oauth.go) with the GitHub client secret. Instructions for secrets to follow.

```bash
pushd wasmcloud.banking
npm i
npm run build --workspaces --if-present
popd
wash build
```

## Running

```shell
wash dev
```

Alternatively, you can use the included [Dockerfile](./Dockerfile) to avoid installing npm, go and tinygo locally, or just to have a convenient initial deployment.

```shell
docker build -t wasmcloud-banking:latest .
docker run --rm -p 4222:4222 -p 8000:8000 -it wasmcloud-banking:latest wash up
```

Once your container is up and running, use `wash` to deploy the application.

```shell
wash app deploy ./application.yaml
```

## Interacting with the demo

Navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000) and sign in to view your account.

After signing in, run the script to add transactions. The `BANK_USER` is your GitHub username:

```shell
BANK_USER=brooksmtownsend ./new-transaction.sh
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [Adding Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=tinygo) section of the wasmCloud documentation.
