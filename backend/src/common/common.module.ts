import { Global, Module } from '@nestjs/common';
import { TransactionHelper } from './database/transaction.helper';

/**
 * Global module for cross-cutting infrastructure shared by every feature module.
 * Marked @Global so TransactionHelper need not be re-imported everywhere.
 */
@Global()
@Module({
  providers: [TransactionHelper],
  exports: [TransactionHelper],
})
export class CommonModule {}
