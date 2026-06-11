'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/FormField';
import { Table, Td } from '@/components/ui/Table';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/StateViews';
import { useDailySummary } from '@/hooks/use-reports';
import type { DailySummaryFilters } from '@/services/reports.service';
import { formatDate, formatMoney } from '@/lib/format';

export function ReportsView() {
  const [draft, setDraft] = useState<DailySummaryFilters>({});
  const [applied, setApplied] = useState<DailySummaryFilters>({});
  const { data, isLoading, isError, error, refetch } = useDailySummary(applied);

  const apply = () => {
    // Drop empty strings so they are not sent as blank query params.
    const cleaned: DailySummaryFilters = {};
    if (draft.from) cleaned.from = draft.from;
    if (draft.to) cleaned.to = draft.to;
    setApplied(cleaned);
  };

  const reset = () => {
    setDraft({});
    setApplied({});
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label="From"
            type="date"
            value={draft.from ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
          />
          <TextField
            label="To"
            type="date"
            value={draft.to ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
          />
          <Button onClick={apply}>Apply filters</Button>
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">Defaults to the last 30 days when no range is set.</p>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading summary…" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No activity in this range" description="Try a different date range." />
      ) : (
        <Table headers={['Date', 'Credits', 'Debits', 'Transactions', 'Active wallets']}>
          {data.map((row) => (
            <tr key={row.date}>
              <Td className="font-medium">{formatDate(row.date)}</Td>
              <Td className="text-emerald-600">{formatMoney(row.totalCredits)}</Td>
              <Td className="text-rose-600">{formatMoney(row.totalDebits)}</Td>
              <Td>{row.transactionCount}</Td>
              <Td>{row.activeWallets}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
