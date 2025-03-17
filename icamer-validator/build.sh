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
# TODO: also pull the wasmpay-messaging component

# Build component
go generate ./...
rm bindings.wadge.go
tinygo build \
    -no-debug \
    -gc leaking \
    -scheduler none \
    --target=wasip2 \
    --wit-package ./wit \
    --wit-world hello \
    -o ./build/nordhaven_validator.wasm

# Compose component
wac plug ../wasmpay-messaging/wasmpay_messaging.wasm \
    --plug ./build/nordhaven_validator.wasm \
    -o ./build/nordhaven-validator.composed.wasm