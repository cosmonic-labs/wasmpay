# Ledger Service

Ledger Service is a standalone Go binary intended to be run inside of container, which the WasmPay components will then communicate with.

## Running the service locally

The service can be run with a simple `go run main.go` for local development

## Invoking the service

Once the ledger is running, it can be invoked over HTTP (for example, using curl) like so:

### Bank operations:

### Creating banks:

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{"code":"nordhaven", "name": "First National Bank", "currency": "USD", "country": "USA"}' \
  localhost:8080/proto.ledger.onboard.v1.OnboardService/CreateBank
```

Returns:

```shell
HTTP/1.1 200 OK
Accept-Encoding: gzip
Content-Type: application/json
Date: Tue, 25 Mar 2025 20:30:48 GMT
Content-Length: 10

{"id":"1"}
```

### Getting an individual Bank

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{"code": "nordhaven"}' \
  localhost:8080/proto.ledger.onboard.v1.OnboardService/GetBank
```

Returns:

```shell
Accept-Encoding: gzip
Content-Type: application/json
Date: Tue, 25 Mar 2025 20:26:25 GMT
Content-Length: 91

{"bank":{"code":"nordhaven","name":"First National Bank","country":"USA","currency":"USD"}}
```

### Listing banks

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{}' \
  localhost:8080/proto.ledger.onboard.v1.OnboardService/ListBanks
```

Returns:

```shell
HTTP/1.1 200 OK
Accept-Encoding: gzip
Content-Type: application/json
Date: Tue, 25 Mar 2025 20:30:51 GMT
Content-Length: 97

{"banks":[{"code":"nordhaven", "name":"First National Bank", "country":"USA", "currency":"USD"}]}
```

### Deleting banks

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{"code": "nordhaven"}' \
  localhost:8080/proto.ledger.onboard.v1.OnboardService/DeleteBank
```

Returns:

```
HTTP/1.1 200 OK
Accept-Encoding: gzip
Content-Type: application/json
Date: Tue, 25 Mar 2025 20:31:05 GMT
Content-Length: 2

{}
```

### TODO:

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
