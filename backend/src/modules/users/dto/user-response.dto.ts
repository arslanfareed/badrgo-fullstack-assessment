import { ApiProperty } from '@nestjs/swagger';
import { WalletStatus } from '../../wallets/entities/wallet-status.enum';
import { UserEntity } from '../entities/user.entity';
import { UserStatus } from '../entities/user-status.enum';

export class WalletSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: '950.00' })
  balance: string;

  @ApiProperty({ enum: WalletStatus })
  status: WalletStatus;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ type: [WalletSummaryDto] })
  wallets: WalletSummaryDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.phone = entity.phone;
    dto.email = entity.email;
    dto.status = entity.status;
    dto.wallets = (entity.wallets ?? []).map((wallet) => ({
      id: wallet.id,
      currency: wallet.currency,
      balance: wallet.balance,
      status: wallet.status,
    }));
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
