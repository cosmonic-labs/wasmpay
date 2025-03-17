//go:generate go run go.bytecodealliance.org/cmd/wit-bindgen-go generate --world hello --out gen ./wit
package main

import (
	validation "icamer-validator/gen/wasmpay/platform/validation"
)

func init() {
	// Register the handleRequest function as the handler for all incoming requests.
	validation.Exports.Validate = Validate
}

func Validate(t validation.Transaction) bool {
	return false
}

// Since we don't run this program like a CLI, the `main` function is empty. Instead,
// we call the `handleRequest` function when an HTTP request is received.
func main() {}
