import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../common/dto/paginated-result.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionsRepository: TransactionsRepository) {}

  async findByWallet(
    walletId: string,
    query: TransactionQueryDto,
  ): Promise<PaginatedResult<TransactionResponseDto>> {
    const [transactions, total] = await this.transactionsRepository.findAndCountByWallet(
      walletId,
      query.skip,
      query.limit,
      query.type,
    );

    return new PaginatedResult(
      transactions.map(TransactionResponseDto.fromEntity),
      query.page,
      query.limit,
      total,
    );
  }
}
