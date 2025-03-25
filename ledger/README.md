# Ledger Service

Ledger Service is a standalone Go binary intended to be run inside of container, which the WasmPay components will then communicate with.

## Running the service locally

The service can be run with a simple `go run main.go` for local development

## Invoking the service

Once the ledger is running, it can be invoked over HTTP (for example, using curl) like so:

```shell
curl -i \
  --header "Content-Type: application/json" \
  --data '{"from": "foo", "to": "bar", "amount": 12345, "currency": "USD"}' \
  http://localhost:8080/ledger.v1.LedgerService/Transfer
```

Assuming everything is working, you should get back somethign like:

```shell
HTTP/1.1 200 OK
Accept-Encoding: gzip
Content-Type: application/json
Date: Tue, 25 Mar 2025 04:17:57 GMT
Content-Length: 16

{"success":true}
```
