package fixtures

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/csv"
	"fmt"
	"strconv"
	"strings"

	"github.com/cosmonic-labs/wasmpay/ledger/db"
)

//go:embed country-codes.csv
var countryCodes []byte

// Struct for keeping tracking of the column indexes we care about
type columnIndex struct {
	// ISO3166-1-Alpha-3
	CountryCode int
	// official_name_en
	CountryName int
	// ISO4217-currency_name
	CurrencyName int
	// ISO4217-currency_alphabetic_code
	CurrencyCode int
	// ISO4217-currency_minor_unit
	CurrencyMinorUnit int
}

func PreseedFromFixtures(ctx context.Context, query *db.Queries) error {
	r := bytes.NewReader(countryCodes)

	reader := csv.NewReader(r)
	headers, err := reader.Read()
	if err != nil {
		return fmt.Errorf("failed to read headers from fixtures: %w", err)
	}

	index := parseColumnIndexFromHeaders(headers)

	fixtures, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read records from fixtures: %w", err)
	}

	createCurrency := func(code, name, minor_unit string) error {
		if code == "" {
			return nil
		}

		exists, err := query.CurrencyExists(ctx, code)
		if err != nil {
			return fmt.Errorf("failed to query whether currency exists already: %w", err)
		}
		// SQLite doesn't support boolean returns, so instead we get an int64 back that we have to compare against
		if exists == 1 {
			return nil
		}

		unit, err := strconv.ParseInt(minor_unit, 10, 64)
		if err != nil {
			return fmt.Errorf("failed to convert minor unit from string to in64: %w", err)
		}

		err = query.CreateCurrency(ctx, db.CreateCurrencyParams{
			Code:      code,
			Name:      name,
			MinorUnit: unit,
		})
		if err != nil {
			return fmt.Errorf("failed to create currency: %w", err)
		}

		return err
	}

	for _, fixture := range fixtures {
		country_code := fixture[index.CountryCode]
		country_name := fixture[index.CountryName]

		if err := query.CreateCountry(ctx, db.CreateCountryParams{
			Code: country_code,
			Name: country_name,
		}); err != nil {
			return err
		}

		currency_code := fixture[index.CurrencyCode]
		currency_name := fixture[index.CurrencyName]
		currency_minor_unit := fixture[index.CurrencyMinorUnit]

		// Some countries have more than one currency
		if strings.Contains(currency_code, ",") {
			codes := strings.Split(currency_code, ",")
			names := strings.Split(currency_name, ",")
			minor_units := strings.Split(currency_minor_unit, ",")

			for idx, code := range codes {
				createCurrency(code, names[idx], minor_units[idx])
			}
		} else {
			createCurrency(currency_code, currency_name, currency_minor_unit)
		}
	}

	return nil
}

func parseColumnIndexFromHeaders(headers []string) columnIndex {
	ci := columnIndex{}
	for idx, column := range headers {
		switch column {
		case "ISO3166-1-Alpha-3":
			ci.CountryCode = idx
		case "official_name_en":
			ci.CountryName = idx
		case "ISO4217-currency_alphabetic_code":
			ci.CurrencyCode = idx
		case "ISO4217-currency_name":
			ci.CurrencyName = idx
		case "ISO4217-currency_minor_unit":
			ci.CurrencyMinorUnit = idx
		}
	}

	return ci
}
