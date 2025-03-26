package server

import (
	"context"
	"errors"
	"log/slog"

	"connectrpc.com/connect"
	"github.com/cosmonic-labs/wasmpay/ledger/db"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/ledgerv1"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/api/ledgerv1/ledgerv1connect"
	"github.com/cosmonic-labs/wasmpay/ledger/internal/id"
)

var (
	errFailedToCreateBank = errors.New("unable to create bank")
	errFailedToListBanks  = errors.New("unable to list banks")
	errFailedToDeleteBank = errors.New("unable to delete bank")
	errMissingBank        = errors.New("unable to locate bank")
	errMissingCountry     = errors.New("unsupported country")
)

type BankServer struct {
	DB     *db.Queries
	Logger *slog.Logger
}

var _ ledgerv1connect.BankServiceHandler = (*BankServer)(nil)

func (srv *BankServer) GetBank(ctx context.Context, req *connect.Request[ledgerv1.GetBankRequest]) (*connect.Response[ledgerv1.GetBankResponse], error) {
	logger := srv.Logger.With("method", "get-bank")

	result, err := srv.DB.GetBank(ctx, db.GetBankParams{
		Bid:  req.Msg.GetId(),
		Code: req.Msg.GetCode(),
	})
	if err != nil {
		logger.Error("could not get bank by code", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errMissingBank)
	}

	return &connect.Response[ledgerv1.GetBankResponse]{
		Msg: &ledgerv1.GetBankResponse{
			Bank: &ledgerv1.Bank{
				Id:       result.Bank.Bid,
				Code:     result.Bank.Code,
				Name:     result.Bank.Name,
				Country:  result.Country.Code,
				Currency: result.Currency.Code,
			},
		},
	}, nil
}

func (srv *BankServer) ListBanks(ctx context.Context, req *connect.Request[ledgerv1.ListBanksRequest]) (*connect.Response[ledgerv1.ListBanksResponse], error) {
	logger := srv.Logger.With("method", "list-banks")

	results, err := srv.DB.ListBanksWithCountriesAndCurrencies(ctx)
	if err != nil {
		logger.Error("could not list banks", "error", err)
		return nil, connect.NewError(connect.CodeInternal, errFailedToListBanks)
	}

	var banks []*ledgerv1.Bank
	for _, result := range results {
		banks = append(banks, &ledgerv1.Bank{
			Id:       result.Bank.Bid,
			Code:     result.Bank.Code,
			Name:     result.Bank.Name,
			Country:  result.Country.Code,
			Currency: result.Currency.Code,
		})
	}

	return &connect.Response[ledgerv1.ListBanksResponse]{
		Msg: &ledgerv1.ListBanksResponse{
			Banks: banks,
		},
	}, nil
}

func (srv *BankServer) CreateBank(ctx context.Context, req *connect.Request[ledgerv1.CreateBankRequest]) (*connect.Response[ledgerv1.CreateBankResponse], error) {
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

	bankId, err := id.NewBankId()
	if err != nil {
		logger.Error("could not generate bank id", "error", err)
		return nil, connect.NewError(connect.CodeInternal, errFailedToCreateBank)
	}

	bank, err := srv.DB.CreateBank(ctx, db.CreateBankParams{
		Bid:        bankId,
		Code:       req.Msg.GetCode(),
		Name:       req.Msg.GetName(),
		CountryID:  country.ID,
		CurrencyID: currency.ID,
	})
	if err != nil {
		logger.Error("could not create bank record", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errFailedToCreateBank)
	}

	return &connect.Response[ledgerv1.CreateBankResponse]{
		Msg: &ledgerv1.CreateBankResponse{
			Id: bank.Bid,
		},
	}, nil
}

func (srv *BankServer) DeleteBank(ctx context.Context, req *connect.Request[ledgerv1.DeleteBankRequest]) (*connect.Response[ledgerv1.DeleteBankResponse], error) {
	logger := srv.Logger.With("method", "delete-bank")

	err := srv.DB.DeleteBankByCode(ctx, req.Msg.GetCode())
	if err != nil {
		logger.Error("could not delete bank record", "error", err)
		return nil, connect.NewError(connect.CodeInvalidArgument, errFailedToDeleteBank)
	}

	return &connect.Response[ledgerv1.DeleteBankResponse]{}, nil
}
