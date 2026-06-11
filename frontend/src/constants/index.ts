export const ROUTES = {
  dashboard: '/',
  users: '/users',
  reports: '/reports',
  wallet: (id: string) => `/wallets/${id}`,
} as const;

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'EGP', 'GBP', 'AED'] as const;

export const QUERY_KEYS = {
  overview: ['overview'] as const,
  users: ['users'] as const,
  wallet: (id: string) => ['wallet', id] as const,
  walletTransactions: (id: string) => ['wallet', id, 'transactions'] as const,
  dailySummary: ['daily-summary'] as const,
};
