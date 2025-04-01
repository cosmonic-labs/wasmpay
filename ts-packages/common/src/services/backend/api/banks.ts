import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {ConfigResponse} from '#services/config/context.tsx';

export type Bank = {
  id: string;
  code: string;
  name: string;
  country: string;
  currency: string;
};

function listBanks(config: ConfigResponse) {
  return async () => {
    return apiFetch<Bank[]>(getBaseUrl(config)(config.apiPaths.listBanks), {
      method: 'Get',
    });
  };
}

function getBankById(config: ConfigResponse) {
  return async (bankId: string) => {
    return apiFetch<Bank>(getBaseUrl(config)(config.apiPaths.getBankById.replace(':id', bankId)), {
      method: 'Get',
    });
  };
}

function getBankByCode(config: ConfigResponse) {
  return async (bankCode: string) => {
    return apiFetch<Bank>(
      getBaseUrl(config)(config.apiPaths.getBankByCode.replace(':code', bankCode)),
      {
        method: 'Get',
      },
    );
  };
}

export {listBanks, getBankById, getBankByCode};
