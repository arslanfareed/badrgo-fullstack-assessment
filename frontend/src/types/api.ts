export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';
export type TransactionType = 'CREDIT' | 'DEBIT';

export interface WalletSummary {
  id: string;
  currency: string;
  balance: string;
  status: WalletStatus;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: UserStatus;
  wallets: WalletSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: string;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceId: string;
  description: string | null;
  createdAt: string;
}

export interface WalletOperationResult {
  transaction: Transaction;
  wallet: Wallet;
}

export interface DashboardOverview {
  totalWallets: number;
  totalBalance: string;
  totalCredits: string;
  totalDebits: string;
  transactionCount: number;
}

export interface DailySummary {
  date: string;
  totalCredits: string;
  totalDebits: string;
  transactionCount: number;
  activeWallets: number;
}
