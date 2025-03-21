//go:generate go run go.bytecodealliance.org/cmd/wit-bindgen-go generate --world validator --out gen ../wit
package main

import (
	validation "github.com/cosmonic-labs/wasmpay/icamer-validator/gen/wasmpay/platform/validation"
)

func init() {
	// Register the Validate function as the handler for all incoming requests.
	validation.Exports.Validate = Validate
}

// Validate checks if a transaction is valid based on geographic and currency restrictions
// for a UK bank that accepts EUR from European countries and GBP from UK
func Validate(t validation.Transaction) bool {
	// Check for nonzero amount
	if t.Amount.Amount <= 0 {
		return false
	}

	// Define European countries that use the Euro
	euroCountries := map[string]bool{
		"Austria":      true,
		"AT":           true,
		"Belgium":      true,
		"BE":           true,
		"Cyprus":       true,
		"CY":           true,
		"Estonia":      true,
		"EE":           true,
		"Finland":      true,
		"FI":           true,
		"France":       true,
		"FR":           true,
		"Germany":      true,
		"DE":           true,
		"Greece":       true,
		"GR":           true,
		"Ireland":      true,
		"IE":           true,
		"Italy":        true,
		"IT":           true,
		"Latvia":       true,
		"LV":           true,
		"Lithuania":    true,
		"LT":           true,
		"Luxembourg":   true,
		"LU":           true,
		"Malta":        true,
		"MT":           true,
		"Netherlands":  true,
		"NL":           true,
		"Portugal":     true,
		"PT":           true,
		"Slovakia":     true,
		"SK":           true,
		"Slovenia":     true,
		"SI":           true,
		"Spain":        true,
		"ES":           true,
	}

	// Case 1: Transaction from a European country using Euro
	isEuroCountry := euroCountries[t.Origin.Country]
	isEuroCurrency := t.Amount.Symbol == "EUR" || t.Amount.Name == "EUR"
	
	// Case 2: Transaction from UK using Pounds
	isUK := t.Origin.Country == "UK" || t.Origin.Country == "United Kingdom" || t.Origin.Country == "GB"
	isPound := t.Amount.Symbol == "GBP" || t.Amount.Name == "Pound" || t.Amount.Name == "Pounds"

	// Transaction is valid if EITHER:
	// 1. Origin is a Euro country AND currency is Euro, OR
	// 2. Origin is UK AND currency is Pound
	return (isEuroCountry && isEuroCurrency) || (isUK && isPound)
}

func main() {}
