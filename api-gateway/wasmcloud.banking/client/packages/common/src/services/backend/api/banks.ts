import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';
import {Bank} from '#services/user/hooks/useBanks.ts';

type ListBanksResponse = ApiSuccessResponse<Bank[]>;
type GetBankResponse = ApiSuccessResponse<Bank>;

function listBanks(config: ConfigResponse) {
  return async () => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.listBanks),
      {
        method: 'Get',
      },
      isListBankResponse,
    );
  };
}

function getBankById(config: ConfigResponse) {
  return async (bankId: string) => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.getBankById.replace(':id', bankId)),
      {
        method: 'Get',
      },
      isGetBankResponse,
    );
  };
}

function getBankByCode(config: ConfigResponse) {
  return async (bankCode: string) => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.getBankByCode.replace(':code', bankCode)),
      {
        method: 'Get',
      },
      isGetBankResponse,
    );
  };
}

function isListBankResponse(res: unknown): res is ListBanksResponse {
  return isApiSuccessResponse(res);
}

function isGetBankResponse(res: unknown): res is GetBankResponse {
  return isApiSuccessResponse(res);
}

export {listBanks, getBankById, getBankByCode};
