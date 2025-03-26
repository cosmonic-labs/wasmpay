package server

import (
	"context"
	"errors"
	"log/slog"

	"connectrpc.com/connect"
	"github.com/cosmonic-labs/wasmpay/ledger/db"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/onboardv1"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/onboardv1/onboardv1connect"
)

var (
	errFailedToCreateBank = errors.New("unable to create bank")
	errFailedToListBanks  = errors.New("unable to list banks")
	errFailedToDeleteBank = errors.New("unable to delete bank")
	errMissingBank        = errors.New("unable to locate bank by code")
	errMissingCountry     = errors.New("unsupported country")
)

type OnboardServer struct {
	DB     *db.Queries
	Logger *slog.Logger
}

var _ onboardv1connect.OnboardServiceHandler = (*OnboardServer)(nil)

func (srv *OnboardServer) GetBank(ctx context.Context, req *connect.Request[onboardv1.GetBankRequest]) (*connect.Response[onboardv1.GetBankResponse], error) {
	logger := srv.Logger.With("method", "get-bank")

	result, err := srv.DB.GetBankByCode(ctx, req.Msg.GetCode())
	if err != nil {
		logger.Error("could not get bank by code", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errMissingBank)
	}

	return &connect.Response[onboardv1.GetBankResponse]{
		Msg: &onboardv1.GetBankResponse{
			Bank: &onboardv1.Bank{
				Code:     result.Bank.Code,
				Name:     result.Bank.Name,
				Country:  result.Country.Code,
				Currency: result.Currency.Code,
			},
		},
	}, nil
}

func (srv *OnboardServer) ListBanks(ctx context.Context, req *connect.Request[onboardv1.ListBanksRequest]) (*connect.Response[onboardv1.ListBanksResponse], error) {
	logger := srv.Logger.With("method", "list-banks")

	results, err := srv.DB.ListBanksWithCountriesAndCurrencies(ctx)
	if err != nil {
		logger.Error("could not list banks", "error", err)
		return nil, connect.NewError(connect.CodeInternal, errFailedToListBanks)
	}

	var banks []*onboardv1.Bank
	for _, result := range results {
		banks = append(banks, &onboardv1.Bank{
			Code:     result.Bank.Code,
			Name:     result.Bank.Name,
			Country:  result.Country.Code,
			Currency: result.Currency.Code,
		})
	}

	return &connect.Response[onboardv1.ListBanksResponse]{
		Msg: &onboardv1.ListBanksResponse{
			Banks: banks,
		},
	}, nil
}

func (srv *OnboardServer) CreateBank(ctx context.Context, req *connect.Request[onboardv1.CreateBankRequest]) (*connect.Response[onboardv1.CreateBankResponse], error) {
	logger := srv.Logger.With("method", "create-bank")

	country, err := srv.DB.GetCountryByCode(ctx, req.Msg.GetCountry())
	if err != nil {
		logger.Error("could not find country by code", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errMissingCountry)
	}

	currency, err := srv.DB.GetCurrencyByCode(ctx, req.Msg.GetCurrency())
	if err != nil {
		logger.Error("could not find currency by code", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errMissingCurrency)
	}

	bank, err := srv.DB.CreateBank(ctx, db.CreateBankParams{
		Code:       req.Msg.GetCode(),
		Name:       req.Msg.GetName(),
		CountryID:  country.ID,
		CurrencyID: currency.ID,
	})
	if err != nil {
		logger.Error("could not create bank record", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errFailedToCreateBank)
	}

	return &connect.Response[onboardv1.CreateBankResponse]{
		Msg: &onboardv1.CreateBankResponse{
			Id: uint64(bank.ID),
		},
	}, nil
}

func (srv *OnboardServer) DeleteBank(ctx context.Context, req *connect.Request[onboardv1.DeleteBankRequest]) (*connect.Response[onboardv1.DeleteBankResponse], error) {
	logger := srv.Logger.With("method", "delete-bank")

	err := srv.DB.DeleteBankByCode(ctx, req.Msg.GetCode())
	if err != nil {
		logger.Error("could not delete bank record", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errFailedToDeleteBank)
	}

	return &connect.Response[onboardv1.DeleteBankResponse]{}, nil
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
