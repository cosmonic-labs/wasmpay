import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {hasProperty, isApiSuccessResponse, isObject} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';
import {
  CreateTransaction,
  Transaction,
  TransactionId,
} from '#services/user/hooks/useTransactions.ts';

type StandardError = {
  code: string;
  message: string;
};

type TransactionsResponse = ApiSuccessResponse<Transaction[]>;
type CreateResponse = ApiSuccessResponse<TransactionId>;

function transactions(config: ConfigResponse) {
  return async () => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.transactions),
      {
        method: 'Get',
      },
      isTransactionsResponse,
    );
  };
}

function isTransactionsResponse(res: unknown): res is TransactionsResponse {
  return isApiSuccessResponse(res) || isStandardErrorResponse(res);
}

function createTransaction(config: ConfigResponse) {
  return async (transaction: CreateTransaction) => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.transactions),
      {
        method: 'POST',
        body: JSON.stringify(transaction),
      },
      isCreateResponse,
    );
  };
}

function isCreateResponse(res: unknown): res is CreateResponse {
  return isApiSuccessResponse(res);
}

function isStandardErrorResponse(res: unknown): res is StandardError {
  return isObject(res) && hasProperty(res, 'code') && hasProperty(res, 'message');
}

export {transactions, createTransaction, isCreateResponse, isStandardErrorResponse};
