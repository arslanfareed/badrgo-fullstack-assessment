import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../exceptions';
import { ApiErrorResponse } from '../interceptors/api-response.interface';

/**
 * Owns the error contract. Maps three failure shapes to the
 * { success: false, message, errors } envelope with the right status:
 *   - DomainException: its declared httpStatus (404/409/422)
 *   - HttpException: Nest/validation errors (e.g. 400 from ValidationPipe)
 *   - anything else: 500, logged but not leaked to the client
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, message, errors } = this.normalize(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const body: ApiErrorResponse = { success: false, message, errors };
    response.status(status).json(body);
  }

  private normalize(exception: unknown): {
    status: number;
    message: string;
    errors: string[];
  } {
    if (exception instanceof DomainException) {
      return { status: exception.httpStatus, message: exception.message, errors: [] };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      return this.fromHttpException(status, payload, exception.message);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errors: [],
    };
  }

  private fromHttpException(
    status: number,
    payload: string | object,
    fallbackMessage: string,
  ): { status: number; message: string; errors: string[] } {
    if (typeof payload === 'string') {
      return { status, message: payload, errors: [] };
    }

    // ValidationPipe emits { message: string[] }; flatten it into the errors array.
    const record = payload as { message?: string | string[] };
    const rawMessage = record.message;
    const errors = Array.isArray(rawMessage) ? rawMessage : [];
    const message = Array.isArray(rawMessage)
      ? 'Validation failed'
      : (rawMessage ?? fallbackMessage);

    return { status, message, errors };
  }
}
