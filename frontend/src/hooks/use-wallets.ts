'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import {
  walletsService,
  type CreateWalletPayload,
  type WalletOperationPayload,
} from '@/services/wallets.service';
import type { TransactionType } from '@/types/api';

export function useWallet(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.wallet(id),
    queryFn: () => walletsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useWalletTransactions(id: string, page = 1, type?: TransactionType) {
  return useQuery({
    queryKey: [...QUERY_KEYS.walletTransactions(id), page, type ?? 'ALL'],
    queryFn: () => walletsService.getTransactions(id, page, 20, type),
    enabled: Boolean(id),
  });
}

export function useCreateWallet() {
  return useMutation({
    mutationFn: (payload: CreateWalletPayload) => walletsService.create(payload),
  });
}

/** Shared invalidation after a credit/debit so balance, ledger and dashboard refresh. */
function useWalletMutation(
  operation: (id: string, payload: WalletOperationPayload) => ReturnType<typeof walletsService.credit>,
  walletId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletOperationPayload) => operation(walletId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet(walletId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.walletTransactions(walletId) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.overview });
    },
  });
}

export function useCreditWallet(walletId: string) {
  return useWalletMutation(walletsService.credit, walletId);
}

export function useDebitWallet(walletId: string) {
  return useWalletMutation(walletsService.debit, walletId);
}
