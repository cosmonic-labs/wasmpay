-- For SQLite datatypes, see: https://www.sqlite.org/datatype3.html

CREATE TABLE countries (
  id INTEGER PRIMARY KEY,
  -- ISO 3166 Alpha-3 code
  code text NOT NULL,
  name text NOT NULL
);

CREATE TABLE currencies (
  id INTEGER PRIMARY KEY,
  -- ISO 4217 Alphabetic code
  code text NOT NULL,
  name text NOT NULL,
  -- Number of minor units the currency has
  minor_unit INTEGER NOT NUll
);

CREATE TABLE transfers (
  id   INTEGER PRIMARY KEY,
  source text    NOT NULL,
  target text    NOT NULL,
  amount INTEGER    NOT NULL,
  currency text NOT NULL,
  created_at DATETIME NOT NULL
);
