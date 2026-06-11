import { ApiProperty } from '@nestjs/swagger';

export class DashboardOverviewDto {
  @ApiProperty({ example: 4 })
  totalWallets: number;

  @ApiProperty({ example: '3050.00', description: 'Sum of all wallet balances (decimal string)' })
  totalBalance: string;

  @ApiProperty({ example: '3750.00', description: 'Sum of all credits ever (decimal string)' })
  totalCredits: string;

  @ApiProperty({ example: '700.00', description: 'Sum of all debits ever (decimal string)' })
  totalDebits: string;

  @ApiProperty({ example: 10 })
  transactionCount: number;
}
