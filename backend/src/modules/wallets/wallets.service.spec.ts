import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { TransactionHelper } from '../../common/database/transaction.helper';
import {
  DuplicateReferenceException,
  InsufficientBalanceException,
  WalletInactiveException,
  WalletNotFoundException,
} from '../../common/exceptions';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { TransactionType } from '../transactions/entities/transaction-type.enum';
import { TransactionsRepository } from '../transactions/transactions.repository';
import { UsersService } from '../users/users.service';
import { WalletEntity } from './entities/wallet.entity';
import { WalletStatus } from './entities/wallet-status.enum';
import { WalletsRepository } from './wallets.repository';
import { WalletsService } from './wallets.service';

const buildWallet = (overrides: Partial<WalletEntity> = {}): WalletEntity =>
  ({
    id: 'wallet-1',
    userId: 'user-1',
    currency: 'USD',
    balance: '100.00',
    status: WalletStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [],
    user: undefined as never,
    ...overrides,
  }) as WalletEntity;

describe('WalletsService', () => {
  let service: WalletsService;
  let walletsRepository: jest.Mocked<WalletsRepository>;
  let transactionsRepository: jest.Mocked<TransactionsRepository>;

  beforeEach(async () => {
    const fakeManager = {} as EntityManager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: WalletsRepository,
          useValue: {
            findByIdForUpdate: jest.fn(),
            updateBalance: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: TransactionsRepository,
          useValue: {
            existsByReference: jest.fn().mockResolvedValue(false),
            insert: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: { getEntityOrFail: jest.fn() },
        },
        {
          provide: TransactionHelper,
          // Execute the unit of work immediately with a fake manager, no real DB.
          useValue: {
            runInTransaction: jest
              .fn()
              .mockImplementation((work: (m: EntityManager) => unknown) => work(fakeManager)),
          },
        },
      ],
    }).compile();

    service = module.get(WalletsService);
    walletsRepository = module.get(WalletsRepository);
    transactionsRepository = module.get(TransactionsRepository);

    transactionsRepository.insert.mockImplementation(async (_manager, data) =>
      ({ id: 'tx-1', createdAt: new Date(), ...data }) as TransactionEntity,
    );
  });

  it('credit increases the balance correctly and records balanceBefore/After', async () => {
    walletsRepository.findByIdForUpdate.mockResolvedValue(buildWallet({ balance: '100.00' }));

    const result = await service.credit('wallet-1', { amount: '50.50', referenceId: 'ref-credit' });

    expect(result.transaction.type).toBe(TransactionType.CREDIT);
    expect(result.transaction.balanceBefore).toBe('100.00');
    expect(result.transaction.balanceAfter).toBe('150.50');
    expect(result.wallet.balance).toBe('150.50');
    expect(walletsRepository.updateBalance).toHaveBeenCalledWith(
      expect.anything(),
      'wallet-1',
      '150.50',
    );
  });

  it('debit decreases the balance correctly', async () => {
    walletsRepository.findByIdForUpdate.mockResolvedValue(buildWallet({ balance: '100.00' }));

    const result = await service.debit('wallet-1', { amount: '30.00', referenceId: 'ref-debit' });

    expect(result.transaction.type).toBe(TransactionType.DEBIT);
    expect(result.transaction.balanceAfter).toBe('70.00');
    expect(result.wallet.balance).toBe('70.00');
  });

  it('rejects a duplicate referenceId', async () => {
    walletsRepository.findByIdForUpdate.mockResolvedValue(buildWallet());
    transactionsRepository.existsByReference.mockResolvedValue(true);

    await expect(
      service.credit('wallet-1', { amount: '10.00', referenceId: 'dup' }),
    ).rejects.toBeInstanceOf(DuplicateReferenceException);
    expect(transactionsRepository.insert).not.toHaveBeenCalled();
  });

  it('rejects a debit that exceeds the balance and leaves it unchanged', async () => {
    walletsRepository.findByIdForUpdate.mockResolvedValue(buildWallet({ balance: '50.00' }));

    await expect(
      service.debit('wallet-1', { amount: '100.00', referenceId: 'ref-over' }),
    ).rejects.toBeInstanceOf(InsufficientBalanceException);
    expect(walletsRepository.updateBalance).not.toHaveBeenCalled();
  });

  it('rejects an operation on a missing wallet', async () => {
    walletsRepository.findByIdForUpdate.mockResolvedValue(null);

    await expect(
      service.credit('missing', { amount: '10.00', referenceId: 'ref-x' }),
    ).rejects.toBeInstanceOf(WalletNotFoundException);
  });

  it('rejects an operation on an inactive wallet', async () => {
    walletsRepository.findByIdForUpdate.mockResolvedValue(
      buildWallet({ status: WalletStatus.FROZEN }),
    );

    await expect(
      service.debit('wallet-1', { amount: '10.00', referenceId: 'ref-y' }),
    ).rejects.toBeInstanceOf(WalletInactiveException);
  });
});
