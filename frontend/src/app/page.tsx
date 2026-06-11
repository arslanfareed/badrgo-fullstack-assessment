import { DashboardView } from '@/features/dashboard/DashboardView';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Operational overview across all wallets.</p>
      </div>
      <DashboardView />
    </div>
  );
}
