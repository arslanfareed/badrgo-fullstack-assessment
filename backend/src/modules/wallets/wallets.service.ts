import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, QueryFailedError } from 'typeorm';
import { TransactionHelper } from '../../common/database/transaction.helper';
import {
  DuplicateReferenceException,
  InsufficientBalanceException,
  WalletInactiveException,
  WalletNotFoundException,
} from '../../common/exceptions';
import { Money } from '../../common/utils/money.value-object';
import { TransactionResponseDto } from '../transactions/dto/transaction-response.dto';
import { TransactionType } from '../transactions/entities/transaction-type.enum';
import { TransactionsRepository } from '../transactions/transactions.repository';
import { UsersService } from '../users/users.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreditWalletDto } from './dto/credit-wallet.dto';
import { DebitWalletDto } from './dto/debit-wallet.dto';
import { WalletOperationResultDto } from './dto/wallet-operation-result.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { WalletEntity } from './entities/wallet.entity';
import { WalletStatus } from './entities/wallet-status.enum';
import { WalletsRepository } from './wallets.repository';

// Postgres unique_violation; the safety net for two concurrent requests sharing a referenceId.
const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class WalletsService {
  constructor(
    private readonly walletsRepository: WalletsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly usersService: UsersService,
    private readonly transactionHelper: TransactionHelper,
  ) {}

  async create(dto: CreateWalletDto): Promise<WalletResponseDto> {
    await this.usersService.getEntityOrFail(dto.userId);

    if (await this.walletsRepository.existsByUserAndCurrency(dto.userId, dto.currency)) {
      throw new ConflictException(`User "${dto.userId}" already has a ${dto.currency} wallet.`);
    }

    const wallet = await this.walletsRepository.create(dto);
    return WalletResponseDto.fromEntity(wallet);
  }

  async findById(id: string): Promise<WalletResponseDto> {
    return WalletResponseDto.fromEntity(await this.getEntityOrFail(id));
  }

  credit(walletId: string, dto: CreditWalletDto): Promise<WalletOperationResultDto> {
    return this.execute(walletId, TransactionType.CREDIT, dto);
  }

  debit(walletId: string, dto: DebitWalletDto): Promise<WalletOperationResultDto> {
    return this.execute(walletId, TransactionType.DEBIT, dto);
  }

  /**
   * Shared atomic path for credit and debit. The whole body runs in one transaction:
   * we lock the wallet row (FOR UPDATE) so concurrent ops on the same wallet serialize
   * and cannot overdraw, reject a reused referenceId, compute the new balance with the
   * Money VO (no floats), then append the ledger row and update the cached balance.
   */
  private async execute(
    walletId: string,
    type: TransactionType,
    dto: CreditWalletDto | DebitWalletDto,
  ): Promise<WalletOperationResultDto> {
    try {
      return await this.transactionHelper.runInTransaction(async (manager) => {
        const wallet = await this.lockActiveWallet(manager, walletId);
        await this.assertReferenceUnused(manager, dto.referenceId);

        const amount = Money.fromDecimalString(dto.amount);
        const balanceBefore = Money.fromDecimalString(wallet.balance);
        const balanceAfter = this.computeNextBalance(type, balanceBefore, amount, walletId);

        const transaction = await this.transactionsRepository.insert(manager, {
          walletId,
          type,
          amount: amount.toDecimalString(),
          balanceBefore: balanceBefore.toDecimalString(),
          balanceAfter: balanceAfter.toDecimalString(),
          referenceId: dto.referenceId,
          description: dto.description ?? null,
        });

        await this.walletsRepository.updateBalance(
          manager,
          walletId,
          balanceAfter.toDecimalString(),
        );

        return {
          transaction: TransactionResponseDto.fromEntity(transaction),
          wallet: WalletResponseDto.fromEntity({
            ...wallet,
            balance: balanceAfter.toDecimalString(),
          }),
        };
      });
    } catch (error) {
      // Race-condition safety net: the loser of two same-referenceId inserts lands here.
      if (error instanceof QueryFailedError && this.isUniqueViolation(error)) {
        throw new DuplicateReferenceException(dto.referenceId);
      }
      throw error;
    }
  }

  private async lockActiveWallet(
    manager: EntityManager,
    walletId: string,
  ): Promise<WalletEntity> {
    const wallet = await this.walletsRepository.findByIdForUpdate(manager, walletId);
    if (!wallet) {
      throw new WalletNotFoundException(walletId);
    }
    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new WalletInactiveException(walletId, wallet.status);
    }
    return wallet;
  }

  private async assertReferenceUnused(
    manager: EntityManager,
    referenceId: string,
  ): Promise<void> {
    if (await this.transactionsRepository.existsByReference(manager, referenceId)) {
      throw new DuplicateReferenceException(referenceId);
    }
  }

  private computeNextBalance(
    type: TransactionType,
    balanceBefore: Money,
    amount: Money,
    walletId: string,
  ): Money {
    if (type === TransactionType.CREDIT) {
      return balanceBefore.add(amount);
    }

    const balanceAfter = balanceBefore.subtract(amount);
    if (balanceAfter.isNegative()) {
      throw new InsufficientBalanceException(
        balanceBefore.toDecimalString(),
        amount.toDecimalString(),
      );
    }
    return balanceAfter;
  }

  private async getEntityOrFail(id: string): Promise<WalletEntity> {
    const wallet = await this.walletsRepository.findById(id);
    if (!wallet) {
      throw new WalletNotFoundException(id);
    }
    return wallet;
  }

  private isUniqueViolation(error: QueryFailedError): boolean {
    return (error.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION;
  }
}
