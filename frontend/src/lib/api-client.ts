import axios, { AxiosError } from 'axios';
import type { ApiError, ApiSuccess } from '@/types/api';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Normalizes the backend's { success, message, errors } error envelope into a thrown
 * Error carrying a user-presentable message, so React Query's `error` is always usable.
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

const toRequestError = (error: unknown): ApiRequestError => {
  const axiosError = error as AxiosError<ApiError>;
  const payload = axiosError.response?.data;
  if (payload && payload.success === false) {
    return new ApiRequestError(payload.message, payload.errors ?? []);
  }
  return new ApiRequestError(axiosError.message || 'Unexpected network error');
};

export const unwrap = <T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> =>
  promise.then((response) => response.data.data).catch((error) => {
    throw toRequestError(error);
  });
