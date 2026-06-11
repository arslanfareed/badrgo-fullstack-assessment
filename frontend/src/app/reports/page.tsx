import { ReportsView } from '@/features/reports/ReportsView';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Daily Summary</h1>
        <p className="text-sm text-slate-500">Credits, debits and activity per day.</p>
      </div>
      <ReportsView />
    </div>
  );
}
