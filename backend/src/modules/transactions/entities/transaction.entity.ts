import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletEntity } from '../../wallets/entities/wallet.entity';
import { TransactionType } from './transaction-type.enum';

/**
 * Append-only ledger. Rows are never updated or deleted. The wallet balance is a
 * denormalized cache of this ledger; balance_before / balance_after make every entry
 * fully auditable and let the ledger be reconciled against the cached balance.
 */
@Entity('transactions')
// Pagination + daily-summary aggregation both scan by wallet then by time.
@Index('ix_transactions_wallet_created', ['walletId', 'createdAt'])
@Index('ix_transactions_created', ['createdAt'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: string;

  @Column({ name: 'balance_before', type: 'numeric', precision: 18, scale: 2 })
  balanceBefore: string;

  @Column({ name: 'balance_after', type: 'numeric', precision: 18, scale: 2 })
  balanceAfter: string;

  /**
   * IDEMPOTENCY: globally unique. This constraint is the real guarantee that a
   * referenceId is never processed twice. Under concurrent double-submits one INSERT
   * wins and the other raises a unique violation mapped to DuplicateReferenceException.
   */
  @Index('uq_transactions_reference', { unique: true })
  @Column({ name: 'reference_id', type: 'varchar', length: 128 })
  referenceId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
