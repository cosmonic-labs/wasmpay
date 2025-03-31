import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';

type CreateUserResponse = ApiSuccessResponse<string>;

function createUser(config: ConfigResponse) {
  return async (userId: string) => {
    return apiFetch(
      getBaseUrl(config)(config.apiPaths.createUser.replace(':id', userId)),
      {
        method: 'Post',
      },
      isTransactionsResponse,
    );
  };
}

function isTransactionsResponse(res: unknown): res is CreateUserResponse {
  return isApiSuccessResponse(res);
}

export {createUser};
