# Ledger Service

Ledger Service is a standalone Go binary intended to be run inside of container, which the WasmPay components will then communicate with.

## Running the service locally

The service can be run with a simple `go run main.go` for local development

## Bank operations:

### Create a Bank

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{"code":"nordhaven", "name": "First National Bank", "currency": "USD", "country": "USA"}' \
  localhost:8080/api.ledger.v1.BankService/CreateBank
```

Returns:

```shell
HTTP/1.1 200 OK
Accept-Encoding: gzip
Content-Type: application/json
Date: Tue, 25 Mar 2025 20:30:48 GMT
Content-Length: 10

{"id":"bk_GO2KCqj"}
```

### Getting an individual Bank

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{"code": "nordhaven"}' \
  localhost:8080/api.ledger.v1.BankService/GetBank
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
  localhost:8080/api.ledger.v1.BankService/ListBanks
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
  localhost:8080/api.ledger.v1.BankService/DeleteBank
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

## Transaction operations:

### Store a Transaction

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{"origin":"nordhaven", "destination": "icamer", "amount": 10000, "currency": "USD", "status": {"status": "approved", "reason": ""}}' \
  localhost:8080/api.ledger.v1.TransactionService/StoreTransaction
```

Returns:

```shell
HTTP/1.1 200 OK
Accept-Encoding: gzip
Content-Type: application/json
Date: Wed, 26 Mar 2025 02:17:04 GMT
Content-Length: 20

{"id":"txn_OnJqOSK"}
```

### List Transactions

```shell
curl -i -X POST \
  --header "Content-Type: application/json" \
  -d '{}' \
  localhost:8080/api.ledger.v1.TransactionService/ListTransactions
```

Returns:

```shell
HTTP/1.1 200 OK
Accept-Encoding: gzip
Content-Type: application/json
Date: Wed, 26 Mar 2025 02:23:06 GMT
Content-Length: 148

{"transactions":[{"id":"txn_hfH2bn9","origin":"icamer","destination":"nordhaven","amount":"10000","currency":"USD","status":{"status":"approved"}}]}
```
