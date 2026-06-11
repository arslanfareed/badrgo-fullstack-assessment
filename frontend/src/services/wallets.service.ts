import { apiClient, unwrap } from '@/lib/api-client';
import type {
  ApiSuccess,
  Paginated,
  Transaction,
  TransactionType,
  Wallet,
  WalletOperationResult,
} from '@/types/api';

export interface CreateWalletPayload {
  userId: string;
  currency: string;
}

export interface WalletOperationPayload {
  amount: string;
  referenceId: string;
  description?: string;
}

export const walletsService = {
  create: (payload: CreateWalletPayload) =>
    unwrap<Wallet>(apiClient.post<ApiSuccess<Wallet>>('/wallets', payload)),

  getById: (id: string) => unwrap<Wallet>(apiClient.get<ApiSuccess<Wallet>>(`/wallets/${id}`)),

  credit: (id: string, payload: WalletOperationPayload) =>
    unwrap<WalletOperationResult>(
      apiClient.post<ApiSuccess<WalletOperationResult>>(`/wallets/${id}/credit`, payload),
    ),

  debit: (id: string, payload: WalletOperationPayload) =>
    unwrap<WalletOperationResult>(
      apiClient.post<ApiSuccess<WalletOperationResult>>(`/wallets/${id}/debit`, payload),
    ),

  getTransactions: (id: string, page = 1, limit = 20, type?: TransactionType) =>
    unwrap<Paginated<Transaction>>(
      apiClient.get<ApiSuccess<Paginated<Transaction>>>(`/wallets/${id}/transactions`, {
        params: { page, limit, ...(type ? { type } : {}) },
      }),
    ),
};
