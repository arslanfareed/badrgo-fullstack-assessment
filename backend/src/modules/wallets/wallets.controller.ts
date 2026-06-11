import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { TransactionQueryDto } from '../transactions/dto/transaction-query.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreditWalletDto } from './dto/credit-wallet.dto';
import { DebitWalletDto } from './dto/debit-wallet.dto';
import { WalletsService } from './wallets.service';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ResponseMessage('Wallet created successfully')
  @ApiOperation({ summary: 'Create a wallet for a user' })
  create(@Body() dto: CreateWalletDto) {
    return this.walletsService.create(dto);
  }

  @Get(':id')
  @ResponseMessage('Wallet retrieved successfully')
  @ApiOperation({ summary: 'Get a wallet by id' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.walletsService.findById(id);
  }

  @Post(':id/credit')
  @ResponseMessage('Wallet credited successfully')
  @ApiOperation({ summary: 'Credit a wallet (idempotent, transactional)' })
  credit(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreditWalletDto) {
    return this.walletsService.credit(id, dto);
  }

  @Post(':id/debit')
  @ResponseMessage('Wallet debited successfully')
  @ApiOperation({ summary: 'Debit a wallet (idempotent, locked, balance-checked)' })
  debit(@Param('id', ParseUUIDPipe) id: string, @Body() dto: DebitWalletDto) {
    return this.walletsService.debit(id, dto);
  }

  @Get(':id/transactions')
  @ResponseMessage('Transactions retrieved successfully')
  @ApiOperation({ summary: 'List a wallet ledger (paginated, optional type filter)' })
  findTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.transactionsService.findByWallet(id, query);
  }
}
