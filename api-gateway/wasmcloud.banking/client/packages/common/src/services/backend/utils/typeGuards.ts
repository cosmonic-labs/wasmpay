import {ApiErrorResponse, ApiSuccessResponse, ApiResponse} from '#services/backend/types.ts';

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

function hasProperty<T extends Record<string, unknown>, K extends string>(
  obj: T,
  prop: K,
): obj is T & Record<K, unknown> {
  return obj && prop in obj;
}

function isApiErrorResponse<ErrorData>(res: unknown): res is ApiErrorResponse<ErrorData> {
  return isApiResponse(res) && hasProperty(res, 'error') && typeof res.error !== 'undefined';
}

function isApiSuccessResponse<Data = unknown>(res: unknown): res is ApiSuccessResponse<Data> {
  return !isApiErrorResponse(res) && isApiResponse(res);
}

function isApiResponse<Data extends Record<string, unknown>>(
  res: unknown,
): res is ApiResponse<Data> {
  return isObject(res) && hasProperty(res, 'data');
}

export {isObject, hasProperty, isApiErrorResponse, isApiSuccessResponse, isApiResponse};
