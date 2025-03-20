help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_\-.*]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

all: check-all sync build up deploy

quickstart: check-quickstart up setup
	wash app deploy ./wadm.quickstart.yaml

up: ## Run `wash up -d`
	wash up -d

setup: ## Setup docker, postgres, and ollama. Requires NATS to be running for configuration
	docker run --name wasmcloud-pg -d --rm -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
	ollama pull llava
	wash config put pg-task-db \
	POSTGRES_HOST=127.0.0.1 \
	POSTGRES_PORT=5432 \
	POSTGRES_USERNAME=postgres \
	POSTGRES_PASSWORD=postgres \
	POSTGRES_DATABASE=postgres \
	POSTGRES_TLS_REQUIRED=false
	while true; do nc -zv 127.0.0.1 5432 && break; echo 'waiting for port 5432'; sleep 1; done
	sleep 5
	cat components/task-manager/tasks.sql | PGPASSWORD=postgres psql -Upostgres -h 127.0.0.1

build-ui: ## Build the UI
	npm i
	npm run build --workspaces --if-present
	rm -rf providers/http-router/apps/banking || true
	mkdir providers/http-router/apps/banking
	cp -R client/apps/banking/dist providers/http-router/apps/banking/

build: ## Build all providers and components
	${MAKE} build-ui
	cd providers/http-router && wash build
	cd components/task-manager && wash build
	cd components/image-processor && wash build
	cd components/image-analyzer && wash build

deploy: ## Deploy the wadm manifest
	wash app deploy ./wadm.yaml

sync: ## Fetch wit-deps and generate code
	cd providers/http-router && wit-deps

clean: ## Clean up all resources
	docker stop wasmcloud-pg
	wash config del pg-task-db
	wash drain all
	wash down

check-cmd: # check if $CMD exists, if not print $INS as install instructions
	@which $(CMD) &> /dev/null || echo '"$(CMD)" missing. $(INS)'

check-quickstart:
	@$(MAKE) check-cmd -e CMD=docker -e INS='Install from https://docs.docker.com/get-docker/'
	@$(MAKE) check-cmd -e CMD=ollama -e INS='Install from https://ollama.com/download'
	@$(MAKE) check-cmd -e CMD=psql -e INS='Install from https://www.postgresql.org/download/'
	@$(MAKE) check-cmd -e CMD=wash -e INS='Install from https://wasmcloud.com/docs/installation'

check-all: ## Check for prerequisites
	@$(MAKE) check-cmd -e CMD=go -e INS='Install from https://golang.org/doc/install'
	@$(MAKE) check-cmd -e CMD=tinygo -e INS='Install from https://tinygo.org/getting-started/install/'
	@$(MAKE) check-cmd -e CMD=cargo -e INS='Install from https://www.rust-lang.org/tools/install'
	@$(MAKE) check-cmd -e CMD=npm -e INS='Install from https://nodejs.org/en/download/'
	@$(MAKE) check-cmd -e CMD=docker -e INS='Install from https://docs.docker.com/get-docker/'
	@$(MAKE) check-cmd -e CMD=ollama -e INS='Install from https://ollama.com/download'
	@$(MAKE) check-cmd -e CMD=psql -e INS='Install from https://www.postgresql.org/download/'
	@$(MAKE) check-cmd -e CMD=wash -e INS='Install from https://wasmcloud.com/docs/installation'
	@$(MAKE) check-cmd -e CMD=wit-bindgen -e INS='Install with `cargo install wit-bindgen-cli`'
	@$(MAKE) check-cmd -e CMD=wit-deps -e INS='Install with `cargo install wit-deps-cli`'
	@$(MAKE) check-cmd -e CMD=wit-bindgen-wrpc -e INS='Install with `cargo install wrpc`'

.PHONY: setup build deploy sync clean up all
