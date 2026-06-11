import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { WalletStatus } from './wallet-status.enum';

@Entity('wallets')
// A user holds at most one wallet per currency.
@Index('uq_wallets_user_currency', ['userId', 'currency'], { unique: true })
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.wallets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'char', length: 3 })
  currency: string;

  /**
   * FINANCIAL SAFETY: balance is NUMERIC(18,2), never a float. TypeORM returns
   * NUMERIC as a string to preserve precision; it is parsed into the Money value
   * object for any arithmetic. A DB-level CHECK (balance >= 0) is added by migration
   * as the last-line guard against a negative balance.
   */
  @Column({ type: 'numeric', precision: 18, scale: 2, default: '0' })
  balance: string;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
  transactions: TransactionEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
