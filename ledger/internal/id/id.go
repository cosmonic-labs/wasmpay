package id

import "fmt"

const (
	PrefixBank        = "bk"
	PrefixTransaction = "txn"
	// We override the default alphabet from nanoid to skip _ and -
	alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
)

func NewBankId() (string, error) {
	return generatePrefixId(PrefixBank)
}

func NewTransactionId() (string, error) {
	return generatePrefixId(PrefixTransaction)
}

func generatePrefixId(prefix string) (string, error) {
	id, err := Generate(alphabet, 7)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s_%s", prefix, id), nil
}
