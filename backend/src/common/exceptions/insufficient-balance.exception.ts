import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class InsufficientBalanceException extends DomainException {
  readonly httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(available: string, requested: string) {
    super(`Insufficient balance: available ${available}, requested ${requested}.`);
  }
}
