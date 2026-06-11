import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

/**
 * TRANSACTION SAFETY: the callback runs inside a single DB transaction. A throw rolls
 * back, a clean return commits. Every read/write in the unit of work must use the
 * provided EntityManager so the pessimistic lock (SELECT ... FOR UPDATE) and the
 * balance update share one transaction scope.
 */
@Injectable()
export class TransactionHelper {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(work);
  }
}
