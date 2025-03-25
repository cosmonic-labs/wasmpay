// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: proto/ledger/v1/ledger.proto

package ledgerv1connect

import (
	connect "connectrpc.com/connect"
	context "context"
	errors "errors"
	ledgerv1 "github.com/cosmonic-labs/wasmpay/ledger/internal/rpc/ledgerv1"
	http "net/http"
	strings "strings"
)

// This is a compile-time assertion to ensure that this generated file and the connect package are
// compatible. If you get a compiler error that this constant is not defined, this code was
// generated with a version of connect newer than the one compiled into your binary. You can fix the
// problem by either regenerating this code with an older version of connect or updating the connect
// version compiled into your binary.
const _ = connect.IsAtLeastVersion1_13_0

const (
	// LedgerServiceName is the fully-qualified name of the LedgerService service.
	LedgerServiceName = "ledger.v1.LedgerService"
)

// These constants are the fully-qualified names of the RPCs defined in this package. They're
// exposed at runtime as Spec.Procedure and as the final two segments of the HTTP route.
//
// Note that these are different from the fully-qualified method names used by
// google.golang.org/protobuf/reflect/protoreflect. To convert from these constants to
// reflection-formatted method names, remove the leading slash and convert the remaining slash to a
// period.
const (
	// LedgerServiceTransferProcedure is the fully-qualified name of the LedgerService's Transfer RPC.
	LedgerServiceTransferProcedure = "/ledger.v1.LedgerService/Transfer"
)

// LedgerServiceClient is a client for the ledger.v1.LedgerService service.
type LedgerServiceClient interface {
	Transfer(context.Context, *connect.Request[ledgerv1.TransferRequest]) (*connect.Response[ledgerv1.TransferResponse], error)
}

// NewLedgerServiceClient constructs a client for the ledger.v1.LedgerService service. By default,
// it uses the Connect protocol with the binary Protobuf Codec, asks for gzipped responses, and
// sends uncompressed requests. To use the gRPC or gRPC-Web protocols, supply the connect.WithGRPC()
// or connect.WithGRPCWeb() options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewLedgerServiceClient(httpClient connect.HTTPClient, baseURL string, opts ...connect.ClientOption) LedgerServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	ledgerServiceMethods := ledgerv1.File_proto_ledger_v1_ledger_proto.Services().ByName("LedgerService").Methods()
	return &ledgerServiceClient{
		transfer: connect.NewClient[ledgerv1.TransferRequest, ledgerv1.TransferResponse](
			httpClient,
			baseURL+LedgerServiceTransferProcedure,
			connect.WithSchema(ledgerServiceMethods.ByName("Transfer")),
			connect.WithClientOptions(opts...),
		),
	}
}

// ledgerServiceClient implements LedgerServiceClient.
type ledgerServiceClient struct {
	transfer *connect.Client[ledgerv1.TransferRequest, ledgerv1.TransferResponse]
}

// Transfer calls ledger.v1.LedgerService.Transfer.
func (c *ledgerServiceClient) Transfer(ctx context.Context, req *connect.Request[ledgerv1.TransferRequest]) (*connect.Response[ledgerv1.TransferResponse], error) {
	return c.transfer.CallUnary(ctx, req)
}

// LedgerServiceHandler is an implementation of the ledger.v1.LedgerService service.
type LedgerServiceHandler interface {
	Transfer(context.Context, *connect.Request[ledgerv1.TransferRequest]) (*connect.Response[ledgerv1.TransferResponse], error)
}

// NewLedgerServiceHandler builds an HTTP handler from the service implementation. It returns the
// path on which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewLedgerServiceHandler(svc LedgerServiceHandler, opts ...connect.HandlerOption) (string, http.Handler) {
	ledgerServiceMethods := ledgerv1.File_proto_ledger_v1_ledger_proto.Services().ByName("LedgerService").Methods()
	ledgerServiceTransferHandler := connect.NewUnaryHandler(
		LedgerServiceTransferProcedure,
		svc.Transfer,
		connect.WithSchema(ledgerServiceMethods.ByName("Transfer")),
		connect.WithHandlerOptions(opts...),
	)
	return "/ledger.v1.LedgerService/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case LedgerServiceTransferProcedure:
			ledgerServiceTransferHandler.ServeHTTP(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}

// UnimplementedLedgerServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedLedgerServiceHandler struct{}

func (UnimplementedLedgerServiceHandler) Transfer(context.Context, *connect.Request[ledgerv1.TransferRequest]) (*connect.Response[ledgerv1.TransferResponse], error) {
	return nil, connect.NewError(connect.CodeUnimplemented, errors.New("ledger.v1.LedgerService.Transfer is not implemented"))
}
