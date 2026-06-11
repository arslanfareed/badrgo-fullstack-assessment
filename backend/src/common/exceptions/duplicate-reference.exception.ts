import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class DuplicateReferenceException extends DomainException {
  readonly httpStatus = HttpStatus.CONFLICT;

  constructor(referenceId: string) {
    super(`A transaction with referenceId "${referenceId}" has already been processed.`);
  }
}
