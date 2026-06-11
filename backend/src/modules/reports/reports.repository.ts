import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { WalletEntity } from '../wallets/entities/wallet.entity';

export interface DailySummaryRow {
  date: string;
  totalCredits: string;
  totalDebits: string;
  transactionCount: string;
  activeWallets: string;
}

export interface OverviewRow {
  totalWallets: string;
  totalBalance: string;
  totalCredits: string;
  totalDebits: string;
  transactionCount: string;
}

/**
 * Read-side aggregation. The daily summary is computed on demand from the ledger rather
 * than stored, so it is always consistent with the transactions table.
 */
@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactions: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private readonly wallets: Repository<WalletEntity>,
  ) {}

  async getDailySummaries(fromInclusive: Date, toExclusive: Date): Promise<DailySummaryRow[]> {
    return this.transactions
      .createQueryBuilder('t')
      .select("to_char(date_trunc('day', t.created_at), 'YYYY-MM-DD')", 'date')
      .addSelect(
        "COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'CREDIT'), 0)::numeric(18,2)",
        'totalCredits',
      )
      .addSelect(
        "COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'DEBIT'), 0)::numeric(18,2)",
        'totalDebits',
      )
      .addSelect('COUNT(*)', 'transactionCount')
      .addSelect('COUNT(DISTINCT t.wallet_id)', 'activeWallets')
      .where('t.created_at >= :fromInclusive AND t.created_at < :toExclusive', {
        fromInclusive,
        toExclusive,
      })
      .groupBy("date_trunc('day', t.created_at)")
      .orderBy("date_trunc('day', t.created_at)", 'DESC')
      .getRawMany<DailySummaryRow>();
  }

  async getOverview(): Promise<OverviewRow> {
    const walletStats = await this.wallets
      .createQueryBuilder('w')
      .select('COUNT(*)', 'totalWallets')
      .addSelect('COALESCE(SUM(w.balance), 0)::numeric(18,2)', 'totalBalance')
      .getRawOne<{ totalWallets: string; totalBalance: string }>();

    const transactionStats = await this.transactions
      .createQueryBuilder('t')
      .select(
        "COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'CREDIT'), 0)::numeric(18,2)",
        'totalCredits',
      )
      .addSelect(
        "COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'DEBIT'), 0)::numeric(18,2)",
        'totalDebits',
      )
      .addSelect('COUNT(*)', 'transactionCount')
      .getRawOne<{ totalCredits: string; totalDebits: string; transactionCount: string }>();

    return {
      totalWallets: walletStats?.totalWallets ?? '0',
      totalBalance: walletStats?.totalBalance ?? '0.00',
      totalCredits: transactionStats?.totalCredits ?? '0.00',
      totalDebits: transactionStats?.totalDebits ?? '0.00',
      transactionCount: transactionStats?.transactionCount ?? '0',
    };
  }
}
