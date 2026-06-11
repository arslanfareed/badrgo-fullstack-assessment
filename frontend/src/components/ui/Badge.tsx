type Tone = 'green' | 'red' | 'amber' | 'slate' | 'blue';

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ children, tone = 'slate' }: { children: string; tone?: Tone }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'FROZEN':
      return 'amber';
    case 'SUSPENDED':
    case 'CLOSED':
      return 'red';
    case 'CREDIT':
      return 'green';
    case 'DEBIT':
      return 'red';
    default:
      return 'slate';
  }
}
