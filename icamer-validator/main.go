//go:generate go tool wit-bindgen-go generate --world validator --out gen ../wit
package main

import (
	validation "github.com/cosmonic-labs/wasmpay/icamer-validator/gen/wasmpay/platform/validation"
	"go.bytecodealliance.org/cm"
)

func init() {
	// Register the Validate function as the handler for all incoming requests.
	validation.Exports.Validate = Validate
}

func Validate(t validation.Transaction) validation.ValidateResponse {
	// Check for nonzero amount
	if t.Amount <= 0 {
		return validation.ValidateResponse{
			Approved: false,
			Reason:   cm.Some("Amount must be greater than zero"),
		}
	}

	if (t.Origin.Country == "USA" && t.Destination.Country == "UK") ||
		(t.Origin.Country == "UK" && t.Destination.Country == "USA") ||
		(t.Origin.Country == "UK" && t.Destination.Country == "UK") ||
		(t.Origin.Country == "USA" && t.Destination.Country == "USA") {
		return validation.ValidateResponse{
			Approved: true,
			Reason:   cm.None[string](),
		}
	}

	return validation.ValidateResponse{
		Approved: false,
		Reason:   cm.Some("Transaction did not occur in the USA or UK"),
	}
}

func main() {}
