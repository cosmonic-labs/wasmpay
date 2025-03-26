package main

import (
	"context"
	"database/sql"
	_ "embed"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "modernc.org/sqlite"

	"github.com/cosmonic-labs/wasmpay/ledger/db"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/ledgerv1/ledgerv1connect"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/fixtures"
	"github.com/cosmonic-labs/wasmpay/ledger/server"
)

//go:embed sql/schema.sql
var ddl string

var (
	bindAddr string
	dbStore  string
)

func main() {
	flag.StringVar(&bindAddr, "bind-addr", "localhost:8080", "Address to bind to.")
	flag.StringVar(&dbStore, "db-store", ":memory:", "Either :memory: for in-memory or path to file for storing the database.")
	flag.Parse()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	if err := run(bindAddr, dbStore); err != nil {
		log.Fatal(err)
	}
}

func run(bindAddr, dbStore string) error {
	logger := slog.Default()

	client, err := setupDatabase(dbStore)
	if err != nil {
		return err
	}

	mux := http.NewServeMux()

	path, handler := ledgerv1connect.NewBankServiceHandler(&server.BankServer{
		DB:     client,
		Logger: logger.With(slog.String("service", "bank-svc")),
	})
	mux.Handle(path, handler)

	path, handler = ledgerv1connect.NewTransactionServiceHandler(&server.TransactionServer{
		DB:     client,
		Logger: logger.With(slog.String("service", "transaction-svc")),
	})
	mux.Handle(path, handler)

	// Catch SIGINT and SIGTERM to attempt graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	server := &http.Server{
		Addr:    bindAddr,
		Handler: mux,
	}

	go func() {
		<-ctx.Done()
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = server.Shutdown(ctx)
	}()

	logger.Info("HTTP Server started", slog.String("addr", bindAddr))
	return server.ListenAndServe()
}

func setupDatabase(dbStore string) (*db.Queries, error) {
	// TODO: pass in
	ctx := context.Background()

	// Enable foreign keys support
	database, err := sql.Open("sqlite", dbStore+"?_pragma=foreign_keys(1)")
	if err != nil {
		return nil, fmt.Errorf("failed to open SQLite database: %w", err)
	}

	// create tables
	if _, err := database.ExecContext(ctx, ddl); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	client := db.New(database)

	// preseed country and currency data
	if err := fixtures.PreseedFromFixtures(ctx, client); err != nil {
		return nil, fmt.Errorf("failed to preseed the database: %w", err)
	}

	return client, nil
}
