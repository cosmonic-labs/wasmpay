#!/bin/bash

mkdir build || true

# Required tool checks
if ! command -v cargo &>/dev/null; then
	echo "cargo could not be found, please install it to proceed."
	exit 1
fi
if ! command -v wac &>/dev/null; then
	echo "wac could not be found, installing via cargo-binstall."
	if ! command -v cargo-binstall &>/dev/null; then
		echo "cargo-binstall could not be found, installing for wac-cli."
		cargo install cargo-binstall
	fi
	cargo binstall wac-cli --force -y
fi
if ! command -v wash &>/dev/null; then
	echo "wash could not be found, installing via cargo-binstall."
	if ! command -v cargo-binstall &>/dev/null; then
		echo "cargo-binstall could not be found, installing for wac-cli."
		cargo install cargo-binstall
	fi
	cargo binstall wash-cli --force -y
fi
# TODO: also pull the wasmpay-messaging component

# Build component
# cargo build --target wasm32-wasip2

# Compose component
cargo build --release --target wasm32-wasip2
wac plug ../wasmpay-messaging/build/wasmpay_messaging.wasm \
    --plug ./target/wasm32-wasip2/release/wasmpay_validator.wasm \
    -o ./build/wasmpay-validator.composed.wasm
    # --plug ./target/wasm32-wasip2/debug/nordhaven_validator.wasm \
