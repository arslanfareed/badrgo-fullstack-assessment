'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/FormField';
import { Alert } from '@/components/states/StateViews';
import { useCreditWallet, useDebitWallet } from '@/hooks/use-wallets';
import { formatMoney } from '@/lib/format';
import { walletOperationSchema, type WalletOperationFormValues } from './operation.schema';

type Operation = 'CREDIT' | 'DEBIT';

export function CreditDebitForm({ walletId }: { walletId: string }) {
  const [operation, setOperation] = useState<Operation>('CREDIT');
  const credit = useCreditWallet(walletId);
  const debit = useDebitWallet(walletId);
  const active = operation === 'CREDIT' ? credit : debit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WalletOperationFormValues>({ resolver: zodResolver(walletOperationSchema) });

  const onSubmit = handleSubmit((values) => {
    const payload = {
      amount: values.amount,
      referenceId: values.referenceId,
      description: values.description || undefined,
    };
    active.mutate(payload, { onSuccess: () => reset() });
  });

  const switchOperation = (next: Operation) => {
    setOperation(next);
    credit.reset();
    debit.reset();
  };

  return (
    <Card>
      <div className="flex gap-2">
        {(['CREDIT', 'DEBIT'] as const).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => switchOperation(op)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              operation === op ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {op === 'CREDIT' ? 'Credit' : 'Debit'}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <TextField
          label="Amount"
          placeholder="100.00"
          inputMode="decimal"
          {...register('amount')}
          error={errors.amount?.message}
        />
        <TextField
          label="Reference ID (idempotency key)"
          placeholder="order-7f3a2b"
          {...register('referenceId')}
          error={errors.referenceId?.message}
        />
        <TextField
          label="Description (optional)"
          placeholder="Ride payment"
          {...register('description')}
          error={errors.description?.message}
        />

        <Button
          type="submit"
          variant={operation === 'CREDIT' ? 'primary' : 'danger'}
          isLoading={active.isPending}
        >
          {operation === 'CREDIT' ? 'Credit wallet' : 'Debit wallet'}
        </Button>

        {active.isSuccess && (
          <Alert tone="success">
            {operation === 'CREDIT' ? 'Credited' : 'Debited'} successfully. New balance:{' '}
            {formatMoney(active.data.wallet.balance)}
          </Alert>
        )}
        {active.isError && <Alert tone="error">{(active.error as Error).message}</Alert>}
      </form>
    </Card>
  );
}
