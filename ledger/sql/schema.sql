-- For SQLite datatypes, see: https://www.sqlite.org/datatype3.html
CREATE TABLE transfers (
  id   INTEGER PRIMARY KEY,
  from text    NOT NULL,
  to   text    NOT NULL,
  amount INTEGER    NOT NULL,
  currency text NOT NULL,
  created_at DATETIME NOT NULL
);
