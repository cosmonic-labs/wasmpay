package server

import (
	"context"
	"errors"
	"log/slog"

	"connectrpc.com/connect"
	"github.com/cosmonic-labs/wasmpay/ledger/db"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/transactionv1"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/transactionv1/transactionv1connect"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/id"
)

var (
	errFailedToStoreTxn   = errors.New("unable to store transaction")
	errFailedToListTxn    = errors.New("unable to list transactions")
	errMissingOrigin      = errors.New("unable to locate origin bank")
	errMissingDestination = errors.New("unable to locate destination bank")
	errMissingCurrency    = errors.New("unsupported currency")
)

type TransactionServer struct {
	DB     *db.Queries
	Logger *slog.Logger
}

var _ transactionv1connect.TransactionServiceHandler = (*TransactionServer)(nil)

func (srv *TransactionServer) StoreTransaction(ctx context.Context, req *connect.Request[transactionv1.StoreTransactionRequest]) (*connect.Response[transactionv1.StoreTransactionResponse], error) {
	logger := srv.Logger.With(slog.String("method", "StoreTransaction"))
	// Ensure origin and destination are banks we know about
	origin, err := srv.DB.GetBankByCode(ctx, req.Msg.GetOrigin())
	if err != nil {
		logger.Error("could not find origin bank", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errMissingOrigin)
	}
	destination, err := srv.DB.GetBankByCode(ctx, req.Msg.GetDestination())
	if err != nil {
		logger.Error("could not find destination bank", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errMissingDestination)
	}
	currency, err := srv.DB.GetCurrencyByCode(ctx, req.Msg.GetCurrency())
	if err != nil {
		logger.Error("could not find currency", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errMissingCurrency)
	}

	txnid, err := id.NewTransactionId()
	if err != nil {
		logger.Error("could not generate transaction id", "error", err)
		return nil, connect.NewError(connect.CodeInternal, errFailedToStoreTxn)
	}

	_, err = srv.DB.CreateTransaction(ctx, db.CreateTransactionParams{
		Tid:           txnid,
		OriginID:      origin.Bank.ID,
		DestinationID: destination.Bank.ID,
		CurrencyID:    currency.ID,
		Amount:        int64(req.Msg.GetAmount()),
		Status:        req.Msg.Status.GetStatus(),
		Reason:        req.Msg.Status.GetReason(),
	})
	if err != nil {
		logger.Error("could not store transaction", "error", err)
		return nil, connect.NewError(connect.CodeInternal, errFailedToStoreTxn)
	}

	return &connect.Response[transactionv1.StoreTransactionResponse]{
		Msg: &transactionv1.StoreTransactionResponse{
			Id: txnid,
		},
	}, nil
}

func (srv *TransactionServer) ListTransactions(ctx context.Context, req *connect.Request[transactionv1.ListTransactionsRequest]) (*connect.Response[transactionv1.ListTransactionsResponse], error) {
	logger := srv.Logger.With(slog.String("method", "ListTransaction"))

	results, err := srv.DB.ListTransactions(ctx)
	if err != nil {
		logger.Error("could not load transactions", "error", err)
		return nil, connect.NewError(connect.CodeInternal, errFailedToListTxn)
	}

	var txns []*transactionv1.Transaction
	for _, result := range results {
		txns = append(txns, &transactionv1.Transaction{
			Id:          result.Transaction.Tid,
			Origin:      result.Bank.Code,
			Destination: result.Bank_2.Code,
			Amount:      uint64(result.Transaction.Amount),
			Currency:    result.Currency.Code,
			Status: &transactionv1.TransactionStatus{
				Status: result.Transaction.Status,
				Reason: result.Transaction.Reason,
			},
		})
	}

	return &connect.Response[transactionv1.ListTransactionsResponse]{
		Msg: &transactionv1.ListTransactionsResponse{
			Transactions: txns,
		},
	}, nil
}
