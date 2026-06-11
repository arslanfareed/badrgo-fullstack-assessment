import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from '../../transactions/dto/transaction-response.dto';
import { WalletResponseDto } from './wallet-response.dto';

export class WalletOperationResultDto {
  @ApiProperty({ type: TransactionResponseDto })
  transaction: TransactionResponseDto;

  @ApiProperty({ type: WalletResponseDto })
  wallet: WalletResponseDto;
}
