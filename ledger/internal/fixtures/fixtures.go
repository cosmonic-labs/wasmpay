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
	"github.com/cosmonic-labs/wasmpay/ledger/internal/id"
)

//go:embed banks.csv
var banks []byte

//go:embed country-codes.csv
var countryCodes []byte

// Struct for keeping tracking of the column indexes in the bank fixtures
type bankColumnIndex struct {
	// Required: The code used for fetching the bank via the API (i.e. nordhaven)
	Code int
	// Required: Full name of the bank
	Name int
	// Required: ISO3166 Alpha-3 code for the country (i.e. USA)
	Country int
	// Required: ISO4217 currency name (i.e. USD)
	Currency int
}

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
	err := preseedCountriesAndCurrencies(ctx, query)
	if err != nil {
		return err
	}

	err = preseedBanks(ctx, query)
	if err != nil {
		return err
	}

	return nil
}

func preseedCountriesAndCurrencies(ctx context.Context, query *db.Queries) error {
	r := bytes.NewReader(countryCodes)

	reader := csv.NewReader(r)
	headers, err := reader.Read()
	if err != nil {
		return fmt.Errorf("failed to read headers from fixtures: %w", err)
	}

	ci := newColumnIndexFromHeaders(headers)

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
		country_code := fixture[ci.CountryCode]
		country_name := fixture[ci.CountryName]

		if err := query.CreateCountry(ctx, db.CreateCountryParams{
			Code: country_code,
			Name: country_name,
		}); err != nil {
			return err
		}

		currency_code := fixture[ci.CurrencyCode]
		currency_name := fixture[ci.CurrencyName]
		currency_minor_unit := fixture[ci.CurrencyMinorUnit]

		// Some countries have more than one currency
		if strings.Contains(currency_code, ",") {
			codes := strings.Split(currency_code, ",")
			names := strings.Split(currency_name, ",")
			minor_units := strings.Split(currency_minor_unit, ",")

			for idx, code := range codes {
				err := createCurrency(code, names[idx], minor_units[idx])
				if err != nil {
					return err
				}
			}
		} else {
			err := createCurrency(currency_code, currency_name, currency_minor_unit)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func preseedBanks(ctx context.Context, query *db.Queries) error {
	r := bytes.NewReader(banks)

	reader := csv.NewReader(r)
	headers, err := reader.Read()
	if err != nil {
		return fmt.Errorf("failed to read headers from fixtures: %w", err)
	}

	bci := newBankColumnIndexFromHeaders(headers)

	entities, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read records for bank entity fixtures: %w", err)
	}

	for _, entity := range entities {
		code := entity[bci.Code]
		name := entity[bci.Name]
		countryCode := entity[bci.Country]
		currencyCode := entity[bci.Currency]
		bid, err := id.NewBankId()
		if err != nil {
			return fmt.Errorf("failed to generate entity ID for fixture (%q): %w", name, err)
		}

		country, err := query.GetCountryByCode(ctx, countryCode)
		if err != nil {
			return fmt.Errorf("could not find country (%q) for fixture (%q): %w", countryCode, name, err)
		}

		currency, err := query.GetCurrencyByCode(ctx, currencyCode)
		if err != nil {
			return fmt.Errorf("could not find currency (%q) for fixture (%q): %w", currencyCode, name, err)
		}

		_, err = query.CreateBank(ctx, db.CreateBankParams{
			Bid:        bid,
			Code:       code,
			Name:       name,
			CountryID:  country.ID,
			CurrencyID: currency.ID,
		})
		if err != nil {
			return fmt.Errorf("failed to create bank entity from fixture: %w", err)
		}
	}

	return nil
}

func newColumnIndexFromHeaders(headers []string) columnIndex {
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

func newBankColumnIndexFromHeaders(headers []string) bankColumnIndex {
	bci := bankColumnIndex{}
	for idx, column := range headers {
		switch strings.ToLower(column) {
		case "code":
			bci.Code = idx
		case "name":
			bci.Name = idx
		case "country":
			bci.Country = idx
		case "currency":
			bci.Currency = idx
		}
	}

	return bci
}
