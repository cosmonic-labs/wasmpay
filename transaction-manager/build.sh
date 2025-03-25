#!/bin/bash

mkdir build || true

# Build component
cargo build --target wasm32-wasip2

# Compose component
wac plug ../wasmpay-platform-harness/build/wasmpay_messaging.wasm \
	--plug ./target/wasm32-wasip2/debug/transaction_manager.wasm \
	-o ./build/transaction-manager.composed.wasm
