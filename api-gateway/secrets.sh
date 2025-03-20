#!/bin/bash

export ENCRYPTION_XKEY_SEED=$(wash keys gen curve -o json | jq -r '.seed')
export TRANSIT_XKEY_SEED=$(wash keys gen curve -o json | jq -r '.seed')

echo $ENCRYPTION_XKEY_SEED
secrets-nats-kv run & echo $!
component_key=$(wash inspect ~/demo/multitier-security/build/http_hello_world_s.wasm -o json | jq -r '.component')
source .env_id
secrets-nats-kv put client_id --string $SECRET_STRING_VALUE
secrets-nats-kv add-mapping $component_key --secret client_id
source .env_secret
secrets-nats-kv put client_secret --string $SECRET_STRING_VALUE
secrets-nats-kv add-mapping $component_key --secret client_secret
