package server

import (
	"context"

	"connectrpc.com/connect"
	"github.com/cosmonic-labs/wasmpay/ledger/db"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/transferv1"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/transferv1/transferv1connect"
)

type TransferServer struct {
	DB *db.Queries
}

var _ transferv1connect.TransferServiceHandler = (*TransferServer)(nil)

func (s *TransferServer) Transfer(ctx context.Context, req *connect.Request[transferv1.TransferRequest]) (*connect.Response[transferv1.TransferResponse], error) {
	res := connect.NewResponse(&transferv1.TransferResponse{
		Success: true,
	})
	return res, nil
}
