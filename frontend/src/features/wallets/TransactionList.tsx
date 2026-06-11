'use client';

import { useState } from 'react';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, Td } from '@/components/ui/Table';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/StateViews';
import { useWalletTransactions } from '@/hooks/use-wallets';
import { formatDateTime, formatMoney } from '@/lib/format';
import type { TransactionType } from '@/types/api';

type Filter = TransactionType | 'ALL';

export function TransactionList({ walletId }: { walletId: string }) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useWalletTransactions(
    walletId,
    page,
    filter === 'ALL' ? undefined : filter,
  );

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setPage(1);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Transactions</h2>
        <div className="flex gap-1">
          {(['ALL', 'CREDIT', 'DEBIT'] as const).map((value) => (
            <button
              key={value}
              onClick={() => changeFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === value ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading transactions…" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="No transactions" description="Credit or debit this wallet to begin." />
      ) : (
        <>
          <Table headers={['Type', 'Amount', 'Before', 'After', 'Reference', 'When']}>
            {data.items.map((tx) => (
              <tr key={tx.id}>
                <Td>
                  <Badge tone={statusTone(tx.type)}>{tx.type}</Badge>
                </Td>
                <Td className="font-medium">{formatMoney(tx.amount)}</Td>
                <Td>{formatMoney(tx.balanceBefore)}</Td>
                <Td>{formatMoney(tx.balanceAfter)}</Td>
                <Td className="text-slate-500">{tx.referenceId}</Td>
                <Td className="text-slate-500">{formatDateTime(tx.createdAt)}</Td>
              </tr>
            ))}
          </Table>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Page {data.meta.page} of {Math.max(data.meta.totalPages, 1)} · {data.meta.total} total
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= data.meta.totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
