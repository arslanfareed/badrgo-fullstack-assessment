import { ApiProperty } from '@nestjs/swagger';

export class DailySummaryDto {
  @ApiProperty({ example: '2026-06-11' })
  date: string;

  @ApiProperty({ example: '1500.00', description: 'Sum of credits that day (decimal string)' })
  totalCredits: string;

  @ApiProperty({ example: '350.00', description: 'Sum of debits that day (decimal string)' })
  totalDebits: string;

  @ApiProperty({ example: 12 })
  transactionCount: number;

  @ApiProperty({ example: 4, description: 'Distinct wallets active that day' })
  activeWallets: number;
}
