// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.6
// 	protoc        (unknown)
// source: api/transaction/v1/transaction_service.proto

package transactionv1

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	unsafe "unsafe"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

var File_api_transaction_v1_transaction_service_proto protoreflect.FileDescriptor

const file_api_transaction_v1_transaction_service_proto_rawDesc = "" +
	"\n" +
	",api/transaction/v1/transaction_service.proto\x12\x12api.transaction.v1\x1a$api/transaction/v1/transaction.proto2\xf6\x01\n" +
	"\x12TransactionService\x12o\n" +
	"\x10StoreTransaction\x12+.api.transaction.v1.StoreTransactionRequest\x1a,.api.transaction.v1.StoreTransactionResponse\"\x00\x12o\n" +
	"\x10ListTransactions\x12+.api.transaction.v1.ListTransactionsRequest\x1a,.api.transaction.v1.ListTransactionsResponse\"\x00B\xdf\x01\n" +
	"\x16com.api.transaction.v1B\x17TransactionServiceProtoP\x01ZBgithub.com/cosmonic-labs/wasmpay/ledger/internal/api/transactionv1\xa2\x02\x03ATX\xaa\x02\x12Api.Transaction.V1\xca\x02\x12Api\\Transaction\\V1\xe2\x02\x1eApi\\Transaction\\V1\\GPBMetadata\xea\x02\x14Api::Transaction::V1b\x06proto3"

var file_api_transaction_v1_transaction_service_proto_goTypes = []any{
	(*StoreTransactionRequest)(nil),  // 0: api.transaction.v1.StoreTransactionRequest
	(*ListTransactionsRequest)(nil),  // 1: api.transaction.v1.ListTransactionsRequest
	(*StoreTransactionResponse)(nil), // 2: api.transaction.v1.StoreTransactionResponse
	(*ListTransactionsResponse)(nil), // 3: api.transaction.v1.ListTransactionsResponse
}
var file_api_transaction_v1_transaction_service_proto_depIdxs = []int32{
	0, // 0: api.transaction.v1.TransactionService.StoreTransaction:input_type -> api.transaction.v1.StoreTransactionRequest
	1, // 1: api.transaction.v1.TransactionService.ListTransactions:input_type -> api.transaction.v1.ListTransactionsRequest
	2, // 2: api.transaction.v1.TransactionService.StoreTransaction:output_type -> api.transaction.v1.StoreTransactionResponse
	3, // 3: api.transaction.v1.TransactionService.ListTransactions:output_type -> api.transaction.v1.ListTransactionsResponse
	2, // [2:4] is the sub-list for method output_type
	0, // [0:2] is the sub-list for method input_type
	0, // [0:0] is the sub-list for extension type_name
	0, // [0:0] is the sub-list for extension extendee
	0, // [0:0] is the sub-list for field type_name
}

func init() { file_api_transaction_v1_transaction_service_proto_init() }
func file_api_transaction_v1_transaction_service_proto_init() {
	if File_api_transaction_v1_transaction_service_proto != nil {
		return
	}
	file_api_transaction_v1_transaction_proto_init()
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_api_transaction_v1_transaction_service_proto_rawDesc), len(file_api_transaction_v1_transaction_service_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   0,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_api_transaction_v1_transaction_service_proto_goTypes,
		DependencyIndexes: file_api_transaction_v1_transaction_service_proto_depIdxs,
	}.Build()
	File_api_transaction_v1_transaction_service_proto = out.File
	file_api_transaction_v1_transaction_service_proto_goTypes = nil
	file_api_transaction_v1_transaction_service_proto_depIdxs = nil
}
