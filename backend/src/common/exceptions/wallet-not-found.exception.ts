import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class WalletNotFoundException extends DomainException {
  readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(walletId: string) {
    super(`Wallet with id "${walletId}" was not found.`);
  }
}
