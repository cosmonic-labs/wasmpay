package id

import "fmt"

// We override the default alphabet from nanoid to skip _ and -
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func NewTransactionId() (string, error) {
	id, err := Generate(alphabet, 7)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("txn_%s", id), nil
}
