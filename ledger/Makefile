.PHONY: help proto sql db

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'p

proto: ## Generate protobuf definitions for the Ledger service
	go tool buf generate

sql: ## Generate database definitions from the SQL files stored in sql/
	go tool sqlc generate

# Alias for sql
db: sql ## Generate database definitions from the SQL files stored in sql/
