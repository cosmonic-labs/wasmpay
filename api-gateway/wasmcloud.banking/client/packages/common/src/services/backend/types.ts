type ApiResponse<T> = {
  error: boolean;
  data?: T;
};

type MergeErrorData<ExtraData> = ExtraData extends {[key: string]: never}
  ? {
      message: string;
    }
  : {
      [Key in keyof ExtraData | keyof {message: string}]: Key extends keyof {message: string}
        ? {message: string}[Key]
        : Key extends keyof ExtraData
        ? ExtraData[Key]
        : never;
    };

type ApiErrorResponse<Data = {[key: string]: never}> = {
  [K in keyof ApiResponse<Data>]-?: K extends 'error' ? true : ApiResponse<MergeErrorData<Data>>[K];
};

type ApiSuccessResponse<T> = {
  [K in keyof ApiResponse<T>]-?: K extends 'error' ? false : ApiResponse<T>[K];
};

class ApiError extends Error {
  constructor(message: string, public response?: Response) {
    super(message);
  }
}

export type {ApiResponse, ApiErrorResponse, ApiSuccessResponse};

export {ApiError};
