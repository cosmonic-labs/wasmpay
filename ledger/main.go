package main

import (
	"context"
	"flag"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/ledgerv1/ledgerv1connect"
	"github.com/cosmonic-labs/wasmpay/ledger/server"
)

var bindAddr string

func main() {
	flag.StringVar(&bindAddr, "bind-addr", "localhost:8080", "Address to bind to.")
	flag.Parse()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	if err := run(bindAddr); err != nil {
		log.Fatal(err)
	}
}

func run(bindAddr string) error {
	logger := slog.Default()
	srv := &server.LedgerServer{}
	mux := http.NewServeMux()
	path, handler := ledgerv1connect.NewLedgerServiceHandler(srv)
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
		server.Shutdown(ctx)
	}()

	logger.Info("HTTP Server started", slog.String("addr", bindAddr))
	return server.ListenAndServe()
}
