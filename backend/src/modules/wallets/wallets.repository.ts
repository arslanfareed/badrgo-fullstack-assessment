import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';

@Injectable()
export class WalletsRepository {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly repository: Repository<WalletEntity>,
  ) {}

  create(data: Pick<WalletEntity, 'userId' | 'currency'>): Promise<WalletEntity> {
    return this.repository.save(this.repository.create(data));
  }

  findById(id: string): Promise<WalletEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  existsByUserAndCurrency(userId: string, currency: string): Promise<boolean> {
    return this.repository.exists({ where: { userId, currency } });
  }

  /**
   * CONCURRENCY: acquires a row-level write lock (SELECT ... FOR UPDATE) on the wallet
   * within the supplied transaction. A second concurrent credit/debit on the same wallet
   * blocks here until this transaction commits, then proceeds against the updated balance.
   * This is what makes two concurrent debits unable to overdraw the wallet.
   */
  findByIdForUpdate(manager: EntityManager, id: string): Promise<WalletEntity | null> {
    return manager.findOne(WalletEntity, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  updateBalance(manager: EntityManager, id: string, balance: string): Promise<unknown> {
    return manager.update(WalletEntity, id, { balance });
  }
}
