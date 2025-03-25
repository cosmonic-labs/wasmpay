-- name: CreateCountry :exec
INSERT INTO countries (
  code, name
) VALUES (
  ?, ?
);

-- name: CreateCurrency :exec
INSERT INTO currencies (
  code, name, minor_unit
) VALUES (
  ?, ?, ?
);

-- name: GetCurrencyByCode :one
SELECT * FROM currencies
WHERE code = ? LIMIT 1;

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

-- name: GetTransfer :one
SELECT * FROM transfers
WHERE id = ? LIMIT 1;

-- name: ListTransfers :many
SELECT * FROM transfers
ORDER BY created_at;
