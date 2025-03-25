//go:generate go tool wit-bindgen-go generate --world validator --out gen ../wit
package main

import (
	validation "github.com/cosmonic-labs/wasmpay/untrusted-validator/gen/wasmpay/platform/validation"
	"go.bytecodealliance.org/cm"
)

func init() {
	validation.Exports.Validate = Validate
}

func Validate(t validation.Transaction) validation.ValidateResponse {
	return validation.ValidateResponse{Approved: true, Reason: cm.None[string]()}
}

func main() {}
