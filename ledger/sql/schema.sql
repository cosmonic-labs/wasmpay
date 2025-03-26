-- For SQLite datatypes, see: https://www.sqlite.org/datatype3.html

CREATE TABLE banks (
  id INTEGER PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  country_id INTEGER NOT NULL,
  currency_id INTEGER NOT NULL,
  UNIQUE(code),
  FOREIGN KEY(country_id) REFERENCES countries(id),
  FOREIGN KEY(currency_id) REFERENCES currencies(id)
);

CREATE TABLE countries (
  id INTEGER PRIMARY KEY,
  -- ISO 3166 Alpha-3 code
  code text NOT NULL,
  name text NOT NULL,
  UNIQUE(code)
);

CREATE TABLE currencies (
  id INTEGER PRIMARY KEY,
  -- ISO 4217 Alphabetic code
  code text NOT NULL,
  name text NOT NULL,
  -- Number of minor units the currency has
  minor_unit INTEGER NOT NUll,
  UNIQUE(code)
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  -- public transaction id
  tid text NOT NULL,
  origin_id INTEGER NOT NULL,
  destination_id INTEGER NOT NULL,
  currency_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tid),
  FOREIGN KEY(origin_id) REFERENCES banks(id),
  FOREIGN KEY(destination_id) REFERENCES banks(id),
  FOREIGN KEY(currency_id) REFERENCES currencies(id)
);
