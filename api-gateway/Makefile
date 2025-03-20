.PHONY: build run build-wasm run-wasm

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build this Go app inside a Docker container
	docker build -t hello:v1 .

run: build ## Run this Go app inside a Docker container
	docker run -p 8080:8080 -it hello:v1

build-wasm-tgo: ## Build this Wasm app with TinyGo
	tinygo build -target wasip2 -wit-world hello -wit-package wit -o build/http-hello-world.wasm

build-wasm: ## Build this Wasm app (with wash)
	wash build

run-wasm: build-wasm-tgo ## Run this Wasm app
	wasmtime serve -Scommon ./build/http-hello-world.wasm

inspect-wasm: build-wasm-tgo ## Inspect this Wasm app
	wash inspect --wit ./build/http-hello-world.wasm
