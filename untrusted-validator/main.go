//go:generate go run go.bytecodealliance.org/cmd/wit-bindgen-go generate --world validator --out gen ../wit
package main

import (
	validation "github.com/cosmonic-labs/wasmpay/untrusted-validator/gen/wasmpay/platform/validation"
)

func init() {
	validation.Exports.Validate = Validate
}

func Validate(t validation.Transaction) bool {
	return false
}

func main() {}
