import {ApiSuccessResponse, ApiError} from '#services/backend/types.ts';
import {isApiErrorResponse, isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';

async function apiFetch<SuccessData = unknown, ErrorData = unknown>(
  url: string,
  options?: RequestInit,
  validator?: (res: unknown) => res is ApiSuccessResponse<SuccessData>,
): Promise<ApiSuccessResponse<SuccessData>> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new ApiError(`Get Request Failed: ${res.statusText}`, res);
    }

    const body = await res.json();

    if (isApiErrorResponse<ErrorData>(body)) {
      throw new ApiError(body.data.message, res);
    }

    if (validator && !validator(body)) {
      throw new ApiError('API response failed provided validation', body);
    }

    if (isApiSuccessResponse<SuccessData>(body)) {
      return body;
    }

    throw new ApiError('Invalid API response', body);
  } catch (e: unknown) {
    if (e instanceof ApiError) throw e;

    throw new ApiError(`API Request Failed: ${e}`);
  }
}

export {apiFetch};
