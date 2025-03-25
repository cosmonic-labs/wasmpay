// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0

package db

import (
	"time"
)

type Bank struct {
	ID         int64
	Code       string
	Name       string
	CountryID  int64
	CurrencyID int64
}

type Country struct {
	ID   int64
	Code string
	Name string
}

type Currency struct {
	ID        int64
	Code      string
	Name      string
	MinorUnit int64
}

type Transfer struct {
	ID        int64
	Source    string
	Target    string
	Amount    int64
	Currency  string
	CreatedAt time.Time
}
