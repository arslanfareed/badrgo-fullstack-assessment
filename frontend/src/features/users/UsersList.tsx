'use client';

import Link from 'next/link';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/states/StateViews';
import { ROUTES } from '@/constants';
import { useUsers } from '@/hooks/use-users';
import { formatMoney } from '@/lib/format';
import type { User } from '@/types/api';
import { AddWalletForm } from './AddWalletForm';

export function UsersList() {
  const { data, isLoading, isError, error, refetch } = useUsers();

  if (isLoading) return <LoadingState label="Loading users…" />;
  if (isError) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
  if (!data || data.items.length === 0) {
    return <EmptyState title="No users yet" description="Create your first user above." />;
  }

  return (
    <div className="space-y-4">
      {data.items.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{user.name}</h3>
            <Badge tone={statusTone(user.status)}>{user.status}</Badge>
          </div>
          <p className="text-sm text-slate-500">
            {user.email} · {user.phone}
          </p>
        </div>
        <AddWalletForm userId={user.id} />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Wallets</p>
        {user.wallets.length === 0 ? (
          <p className="text-sm text-slate-500">No wallets yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.wallets.map((wallet) => (
              <Link
                key={wallet.id}
                href={ROUTES.wallet(wallet.id)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">{wallet.currency}</span>
                <span className="text-slate-900">{formatMoney(wallet.balance)}</span>
                <Badge tone={statusTone(wallet.status)}>{wallet.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
