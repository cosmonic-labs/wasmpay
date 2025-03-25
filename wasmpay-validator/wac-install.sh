#!/usr/bin/env bash

set -euo pipefail

VERSION="v0.6.1"
REPO="bytecodealliance/wac"
BASE_URL="https://github.com/$REPO/releases/download/$VERSION"
INSTALL_DIR="."

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS-$ARCH" in
    "darwin-arm64")
        TARGET="wac-cli-aarch64-apple-darwin" ;;
    "darwin-x86_64")
        TARGET="wac-cli-x86_64-apple-darwin" ;;
    "linux-arm64")
        TARGET="wac-cli-aarch64-unknown-linux-musl" ;;
    "linux-x86_64")
        TARGET="wac-cli-x86_64-unknown-linux-musl" ;;
    *)
        echo "Unsupported OS/ARCH: $OS-$ARCH" >&2
        exit 1 ;;
esac

URL="$BASE_URL/$TARGET"

# Download and install
echo "Downloading $TARGET from $URL..."
curl -L -o "$TARGET" "$URL"
chmod +x "$TARGET"
mv "$TARGET" "$INSTALL_DIR/wac"

echo "wac installed successfully to $INSTALL_DIR/wac"
