import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class UserNotFoundException extends DomainException {
  readonly httpStatus = HttpStatus.NOT_FOUND;

  constructor(userId: string) {
    super(`User with id "${userId}" was not found.`);
  }
}
