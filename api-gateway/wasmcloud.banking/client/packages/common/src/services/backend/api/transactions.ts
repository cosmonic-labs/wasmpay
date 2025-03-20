import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';
import {Transaction} from '#services/user/hooks/useTransactions.ts';

type TransactionsResponse = ApiSuccessResponse<Transaction[]>;

function transactions(config: ConfigResponse) {
  return async (accountId: string) => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.transactions.replace(':id', accountId)),
      {
        method: 'Get',
      },
      isTransactionsResponse,
    );
  };
}

function isTransactionsResponse(res: unknown): res is TransactionsResponse {
  return isApiSuccessResponse(res);
}

export {transactions};
