import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class WalletInactiveException extends DomainException {
  readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(walletId: string, status: string) {
    super(`Wallet "${walletId}" is not active (current status: ${status}).`);
  }
}
