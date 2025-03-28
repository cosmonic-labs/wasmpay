# syntax=docker/dockerfile:1
FROM cgr.dev/chainguard/go AS builder
ENV CGO_ENABLED=0

COPY . /app

RUN <<EOF
cd /app
go build -o /ledger .
EOF

FROM cgr.dev/chainguard/static
COPY --from=builder /ledger /usr/bin/
ENTRYPOINT ["/usr/bin/ledger"]
