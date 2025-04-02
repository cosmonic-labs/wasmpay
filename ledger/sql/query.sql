--
-- Bank queries
--

-- name: GetBank :one
SELECT sqlc.embed(banks), sqlc.embed(countries), sqlc.embed(currencies)
FROM banks
JOIN countries on countries.id = banks.country_id
JOIN currencies on currencies.id = banks.currency_id
WHERE banks.bid = ? OR banks.code = ?
LIMIT 1;

-- name: ListBanks :many
SELECT * FROM banks
LIMIT 50;

-- name: ListBanksWithCountriesAndCurrencies :many
SELECT sqlc.embed(banks), sqlc.embed(countries), sqlc.embed(currencies)
FROM banks
JOIN countries ON countries.id = banks.country_id
JOIN currencies ON currencies.id = banks.currency_id;

-- name: CreateBank :one
INSERT INTO banks (
  bid, code, name, country_id, currency_id
) VALUES (
  ?, ?, ?, ?, ?
)
RETURNING *;

-- Used to preseed
-- name: CreateBankIfNotExists :exec
INSERT OR IGNORE INTO banks (
  bid, code, name, country_id, currency_id
) VALUES (
  ?, ?, ?, ?, ?
);

-- name: DeleteBankByCode :exec
DELETE FROM banks WHERE code = ?;

--
-- Country queries
--

-- name: GetCountryByCode :one
SELECT * FROM countries
WHERE code = ? LIMIT 1;

-- name: GetCountryById :one
SELECT * FROM countries
WHERE id = ? LIMIT 1;

-- name: CreateCountry :exec
INSERT OR IGNORE INTO countries (
  code, name
) VALUES (
  ?, ?
);

--
-- Currency queries
--

-- name: GetCurrencyByCode :one
SELECT * FROM currencies
WHERE code = ? LIMIT 1;

-- name: GetCurrencyById :one
SELECT * FROM currencies
WHERE id = ? LIMIT 1;

-- name: CreateCurrency :exec
INSERT OR IGNORE INTO currencies (
  code, name, minor_unit
) VALUES (
  ?, ?, ?
);

-- name: CurrencyExists :one
SELECT
    EXISTS (
        SELECT
            1
        FROM
            currencies
        where
            code = ?
    );


--
-- Transaction queries
--

-- name: CreateTransaction :one
INSERT INTO transactions (
  tid, origin_id, destination_id, currency_id, amount, status, reason
) VALUES (
  ?, ?, ?, ?, ?, ?, ?
)
RETURNING *;

-- name: ListTransactions :many
SELECT
  sqlc.embed(transactions),
  sqlc.embed(origin),
  sqlc.embed(destination),
  sqlc.embed(currencies)
FROM
  transactions
  JOIN origins AS origin ON origin.id = transactions.origin_id
  JOIN destinations AS destination ON destination.id = transactions.destination_id
  JOIN currencies ON currencies.id = transactions.currency_id
ORDER BY
  created_at DESC;
