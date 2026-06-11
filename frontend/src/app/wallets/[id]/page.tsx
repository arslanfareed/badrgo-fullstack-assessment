import Link from 'next/link';
import { ROUTES } from '@/constants';
import { WalletDetailView } from '@/features/wallets/WalletDetailView';

export default function WalletDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <Link href={ROUTES.users} className="text-sm text-brand hover:underline">
          ← Back to users
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Wallet detail</h1>
      </div>
      <WalletDetailView walletId={params.id} />
    </div>
  );
}
