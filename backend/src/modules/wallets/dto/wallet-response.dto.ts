import { ApiProperty } from '@nestjs/swagger';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletStatus } from '../entities/wallet-status.enum';

export class WalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: '950.00', description: 'Decimal string; never a float.' })
  balance: string;

  @ApiProperty({ enum: WalletStatus })
  status: WalletStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: WalletEntity): WalletResponseDto {
    const dto = new WalletResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.currency = entity.currency;
    dto.balance = entity.balance;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
