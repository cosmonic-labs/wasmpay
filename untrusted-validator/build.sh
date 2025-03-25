#!/bin/bash

# Required tool checks
if ! command -v cargo &> /dev/null
then
    echo "cargo could not be found, please install it to proceed."
    exit 1
fi
if ! command -v wac &> /dev/null
then
    echo "wac could not be found, installing via cargo-binstall."
    if ! command -v cargo-binstall &> /dev/null
    then
        echo "cargo-binstall could not be found, installing for wac-cli."
        cargo install cargo-binstall
    fi
    cargo binstall wac-cli --force -y
fi
if ! command -v wash &> /dev/null
then
    echo "wash could not be found, installing via cargo-binstall."
    if ! command -v cargo-binstall &> /dev/null
    then
        echo "cargo-binstall could not be found, installing for wac-cli."
        cargo install cargo-binstall
    fi
    cargo binstall wash-cli --force -y
fi

# Build component
go generate ./...
rm bindings.wadge.go || true
tinygo build \
    -no-debug \
    -gc leaking \
    -scheduler none \
    --target=wasip2 \
    --wit-package ../wit \
    --wit-world validator \
    -o ./build/untrusted_validator.wasm

# Compose component
wac plug ../wasmpay-platform-harness/build/wasmpay_messaging.wasm \
    --plug ./build/untrusted_validator.wasm \
    -o ./build/untrusted_validator.composed.wasm