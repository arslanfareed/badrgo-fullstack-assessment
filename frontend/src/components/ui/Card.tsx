import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  accent?: 'default' | 'credit' | 'debit';
}

export function StatCard({ label, value, accent = 'default' }: StatCardProps) {
  const accentClass = {
    default: 'text-slate-900',
    credit: 'text-emerald-600',
    debit: 'text-rose-600',
  }[accent];

  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accentClass}`}>{value}</p>
    </Card>
  );
}
