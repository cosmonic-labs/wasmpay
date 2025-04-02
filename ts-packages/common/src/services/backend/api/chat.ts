import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';

export type ChatRequest = {
  source_lang: string;
  target_lang: string;
  text: string;
};

export type ChatResponse = ApiSuccessResponse<string>;

function postChat(config: ConfigResponse) {
  return async (chat: ChatRequest) => {
    return apiFetch<string>(
      getBaseUrl(config)(config.apiPaths.chat),
      {
        method: 'POST',
        body: JSON.stringify(chat),
      },
      isApiSuccessResponse<string>,
    );
  };
}

export {postChat};
