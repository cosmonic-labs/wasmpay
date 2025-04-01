type ApiResponse<T> = {
  error: boolean;
  data?: T;
};

type ApiErrorResponse = {
  code: string;
  message: string;
};

type ApiSuccessResponse<T> = {
  [K in keyof ApiResponse<T>]-?: K extends 'error' ? false : ApiResponse<T>[K];
};

class ApiError extends Error {
  name = 'ApiError';
  code: string;
  message: string;

  constructor(message: string, code?: string, public response?: Response) {
    super(message);
    this.code = code || 'unknown';
    this.message = message;
  }
}

export type {ApiResponse, ApiErrorResponse, ApiSuccessResponse};

export {ApiError};
