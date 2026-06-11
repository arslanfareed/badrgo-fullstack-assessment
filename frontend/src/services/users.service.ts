import { apiClient, unwrap } from '@/lib/api-client';
import type { ApiSuccess, Paginated, User } from '@/types/api';

export interface CreateUserPayload {
  name: string;
  phone: string;
  email: string;
}

export const usersService = {
  list: (page = 1, limit = 50) =>
    unwrap<Paginated<User>>(
      apiClient.get<ApiSuccess<Paginated<User>>>('/users', { params: { page, limit } }),
    ),

  create: (payload: CreateUserPayload) =>
    unwrap<User>(apiClient.post<ApiSuccess<User>>('/users', payload)),
};
