package server

import (
	"context"

	"connectrpc.com/connect"
	"github.com/cosmonic-labs/wasmpay/ledger/db"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/transactionv1"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/transactionv1/transactionv1connect"
)

type TransactionServer struct {
	DB *db.Queries
}

var _ transactionv1connect.TransactionServiceHandler = (*TransactionServer)(nil)

func (s *TransactionServer) Transaction(ctx context.Context, req *connect.Request[transactionv1.TransactionRequest]) (*connect.Response[transactionv1.TransactionResponse], error) {
	res := connect.NewResponse(&transactionv1.TransactionResponse{
		Success: true,
	})
	return res, nil
}
