package server

import (
	"context"

	"connectrpc.com/connect"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/onboardv1"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/onboardv1/onboardv1connect"
)

type OnboardServer struct{}

var _ onboardv1connect.OnboardServiceHandler = (*OnboardServer)(nil)

func (srv *OnboardServer) GetBank(ctx context.Context, req *connect.Request[onboardv1.GetBankRequest]) (*connect.Response[onboardv1.GetBankResponse], error) {
	return nil, nil
}

func (srv *OnboardServer) ListBanks(ctx context.Context, req *connect.Request[onboardv1.ListBanksRequest]) (*connect.Response[onboardv1.ListBanksResponse], error) {
	return nil, nil
}

func (srv *OnboardServer) CreateBank(ctx context.Context, req *connect.Request[onboardv1.CreateBankRequest]) (*connect.Response[onboardv1.CreateBankResponse], error) {
	return nil, nil
}

func (srv *OnboardServer) DeleteBank(ctx context.Context, req *connect.Request[onboardv1.DeleteBankRequest]) (*connect.Response[onboardv1.DeleteBankResponse], error) {
	return nil, nil
}

func (srv *OnboardServer) GetCustomer(ctx context.Context, req *connect.Request[onboardv1.GetCustomerRequest]) (*connect.Response[onboardv1.GetCustomerResponse], error) {
	return nil, nil
}

func (srv *OnboardServer) ListCustomers(ctx context.Context, req *connect.Request[onboardv1.ListCustomersRequest]) (*connect.Response[onboardv1.ListCustomersResponse], error) {
	return nil, nil
}

func (srv *OnboardServer) CreateCustomer(ctx context.Context, req *connect.Request[onboardv1.CreateCustomerRequest]) (*connect.Response[onboardv1.CreateCustomerResponse], error) {
	return nil, nil
}

func (srv *OnboardServer) DeleteCustomer(ctx context.Context, req *connect.Request[onboardv1.DeleteCustomerRequest]) (*connect.Response[onboardv1.DeleteCustomerResponse], error) {
	return nil, nil
}
