import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionType } from '../entities/transaction-type.enum';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  walletId: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ example: '100.50', description: 'Decimal string; never a float.' })
  amount: string;

  @ApiProperty({ example: '0.00' })
  balanceBefore: string;

  @ApiProperty({ example: '100.50' })
  balanceAfter: string;

  @ApiProperty()
  referenceId: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(entity: TransactionEntity): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = entity.id;
    dto.walletId = entity.walletId;
    dto.type = entity.type;
    dto.amount = entity.amount;
    dto.balanceBefore = entity.balanceBefore;
    dto.balanceAfter = entity.balanceAfter;
    dto.referenceId = entity.referenceId;
    dto.description = entity.description;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
