'use client';

import { Badge, statusTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState, LoadingState } from '@/components/states/StateViews';
import { useWallet } from '@/hooks/use-wallets';
import { formatMoney } from '@/lib/format';
import { CreditDebitForm } from './CreditDebitForm';
import { TransactionList } from './TransactionList';

export function WalletDetailView({ walletId }: { walletId: string }) {
  const { data: wallet, isLoading, isError, error, refetch } = useWallet(walletId);

  if (isLoading) return <LoadingState label="Loading wallet…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  if (!wallet) return null;

  const inactive = wallet.status !== 'ACTIVE';

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Balance ({wallet.currency})</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {formatMoney(wallet.balance)}
            </p>
          </div>
          <Badge tone={statusTone(wallet.status)}>{wallet.status}</Badge>
        </div>
        <p className="mt-3 break-all text-xs text-slate-400">Wallet ID: {wallet.id}</p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <div>
          {inactive ? (
            <Card>
              <p className="text-sm text-slate-600">
                This wallet is <strong>{wallet.status}</strong>. Credit and debit operations are
                disabled until it is active.
              </p>
            </Card>
          ) : (
            <CreditDebitForm walletId={walletId} />
          )}
        </div>
        <TransactionList walletId={walletId} />
      </div>
    </div>
  );
}
