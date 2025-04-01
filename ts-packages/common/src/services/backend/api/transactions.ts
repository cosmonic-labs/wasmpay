import type {Bank} from '#services/backend/api/banks.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';

export type Transaction = {
  id: number;
  currency: string;
  amount: string;
  origin: string;
  destination: string;
  status: string;
  reason: string;
};

export type CreateTransaction = {
  currency: string;
  amount: number;
  origin: Bank;
  destination: Bank;
  status: string;
  reason: string;
};

export type TransactionId = {
  id: string;
};

function transactions(config: ConfigResponse) {
  return async () => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.transactions),
      {
        method: 'Get',
      },
      isApiSuccessResponse<Transaction[]>,
    );
  };
}

function createTransaction(config: ConfigResponse) {
  return async (transaction: CreateTransaction, wasmpayPro: boolean) => {
    const headers: [string, string][] = wasmpayPro
      ? [
          ['Content-Type', 'application/json'],
          ['X-Wasmpay-Pro', 'true'],
        ]
      : [['Content-Type', 'application/json']];

    return apiFetch(
      getBaseUrl(config)(config.apiPaths.transactions),
      {
        method: 'POST',
        body: JSON.stringify(transaction),
        headers,
      },
      isApiSuccessResponse<TransactionId>,
    );
  };
}

export {transactions, createTransaction};
