/**
 * Formats a decimal money string ("1234.50") for display ("1,234.50"). Operates on the
 * string the API returns; it never converts money to a JS number, preserving exactness.
 */
export function formatMoney(value: string, currency?: string): string {
  const [whole, fraction = '00'] = value.split('.');
  const negative = whole.startsWith('-');
  const digits = negative ? whole.slice(1) : whole;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `${negative ? '-' : ''}${grouped}.${fraction.padEnd(2, '0')}`;
  return currency ? `${formatted} ${currency}` : formatted;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}
