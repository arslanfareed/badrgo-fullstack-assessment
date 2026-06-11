import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionType } from './entities/transaction-type.enum';

export interface CreateTransactionData {
  walletId: string;
  type: TransactionType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceId: string;
  description?: string | null;
}

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  /**
   * Inserts a ledger row through the supplied EntityManager so it shares the same
   * transaction as the wallet lock and balance update (all-or-nothing).
   */
  insert(manager: EntityManager, data: CreateTransactionData): Promise<TransactionEntity> {
    const entity = manager.create(TransactionEntity, data);
    return manager.save(entity);
  }

  existsByReference(manager: EntityManager, referenceId: string): Promise<boolean> {
    return manager.exists(TransactionEntity, { where: { referenceId } });
  }

  async findAndCountByWallet(
    walletId: string,
    skip: number,
    take: number,
    type?: TransactionType,
  ): Promise<[TransactionEntity[], number]> {
    return this.repository.findAndCount({
      where: { walletId, ...(type ? { type } : {}) },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }
}
