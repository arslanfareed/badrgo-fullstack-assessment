import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length } from 'class-validator';
import { IsPositiveMoney } from '../../../common/validators/is-positive-money.validator';

/**
 * Shared shape for credit and debit. CreditWalletDto / DebitWalletDto extend this so each
 * operation gets its own named Swagger schema while the validation rules stay in one place.
 */
export abstract class WalletOperationDto {
  @ApiProperty({
    example: '100.50',
    description: 'Positive decimal string, max 2 decimals. Never a float.',
  })
  @IsPositiveMoney()
  amount: string;

  @ApiProperty({
    example: 'order-7f3a2b',
    description: 'Idempotency key. Globally unique; a repeat is rejected with 409.',
    maxLength: 128,
  })
  @IsString()
  @Length(1, 128)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  referenceId: string;

  @ApiProperty({ required: false, example: 'Ride payment', maxLength: 255 })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  description?: string;
}
