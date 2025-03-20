FROM node:23-bullseye AS ui-builder

# Set the working directory
WORKDIR /app

# Copy the UI contents into the container
COPY wasmcloud.banking .
RUN npm ci && npm run build --workspaces --if-present

# Stage 2: Build the Component
FROM golang:1-bullseye AS builder

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container
COPY . .
# Copy the built UI into the container
COPY --from=ui-builder /app/client/apps/banking/dist /app/client/apps/banking/dist

# Use curl to download wash and cargo-binstall
RUN apt update && apt install -y curl

# Set environment variable based on architecture
RUN if [ "$(uname -m)" = "aarch64" ]; then export ARCH="arm64"; else export ARCH="amd64"; fi && \
    wget https://github.com/tinygo-org/tinygo/releases/download/v0.34.0/tinygo_0.34.0_$ARCH.deb && \
    dpkg -i tinygo_0.34.0_$ARCH.deb

# Install wash
RUN curl -s https://packagecloud.io/install/repositories/wasmcloud/core/script.deb.sh | bash
RUN apt install wash -y

# Binstall the wasm-tools binary for go generate
RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash
RUN /root/.cargo/bin/cargo-binstall wasm-tools -y

# Build the component
RUN PATH="$PATH:/root/.cargo/bin" wash build

# Stage 2: Create a minimal scratch container with the binary
FROM gcr.io/distroless/static-debian12

# Copy the binary from the builder stage
COPY --from=builder /app/build/banking-app_s.wasm /banking-app_s.wasm
COPY --from=builder /usr/local/bin/wash /usr/local/bin/wash

# Set the entrypoint to the binary
EXPOSE 4222/tcp
EXPOSE 8000/tcp
ENV WASMCLOUD_NATS_HOST=0.0.0.0
CMD ["wash", "up"]