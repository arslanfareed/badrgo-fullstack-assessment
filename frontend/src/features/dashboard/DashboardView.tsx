'use client';

import { StatCard } from '@/components/ui/Card';
import { ErrorState, LoadingState } from '@/components/states/StateViews';
import { useOverview } from '@/hooks/use-reports';
import { formatMoney } from '@/lib/format';

export function DashboardView() {
  const { data, isLoading, isError, error, refetch } = useOverview();

  if (isLoading) return <LoadingState label="Loading dashboard…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total Wallets" value={String(data.totalWallets)} />
      <StatCard label="Total Balance" value={formatMoney(data.totalBalance)} />
      <StatCard label="Transaction Count" value={String(data.transactionCount)} />
      <StatCard label="Total Credits" value={formatMoney(data.totalCredits)} accent="credit" />
      <StatCard label="Total Debits" value={formatMoney(data.totalDebits)} accent="debit" />
    </div>
  );
}
