'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/FormField';
import { QUERY_KEYS, SUPPORTED_CURRENCIES } from '@/constants';
import { useCreateWallet } from '@/hooks/use-wallets';

export function AddWalletForm({ userId }: { userId: string }) {
  const [currency, setCurrency] = useState<string>(SUPPORTED_CURRENCIES[0]);
  const createWallet = useCreateWallet();
  const queryClient = useQueryClient();

  const onAdd = () => {
    createWallet.mutate(
      { userId, currency },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users }) },
    );
  };

  return (
    <div className="flex items-end gap-2">
      <SelectField
        label="New wallet currency"
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        options={SUPPORTED_CURRENCIES.map((code) => ({ value: code, label: code }))}
      />
      <Button variant="secondary" onClick={onAdd} isLoading={createWallet.isPending}>
        Add wallet
      </Button>
      {createWallet.isError && (
        <span className="pb-2 text-sm text-rose-600">{(createWallet.error as Error).message}</span>
      )}
    </div>
  );
}
