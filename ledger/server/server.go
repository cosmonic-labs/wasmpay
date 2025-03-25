package server

import (
	"context"

	"connectrpc.com/connect"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/ledgerv1"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/ledgerv1/ledgerv1connect"
)

type LedgerServer struct{}

var _ ledgerv1connect.LedgerServiceHandler = (*LedgerServer)(nil)

func (s *LedgerServer) Transfer(ctx context.Context, req *connect.Request[ledgerv1.TransferRequest]) (*connect.Response[ledgerv1.TransferResponse], error) {
	res := connect.NewResponse(&ledgerv1.TransferResponse{
		Success: true,
	})
	return res, nil
}
