import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../logger';

export interface ErrorResponse {
  status_code: number;
  message: string;
  error: string;
  request_id: string;
}

// Human readable reason phrases for the statuses we explicitly format.
const REASON_PHRASES: Record<number, string> = {
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

/**
 * Global filter for all non-validation errors.
 *
 * Validation errors are already shaped by `validationPipe` as
 * `{ request_id, status_code, message, errors }` and are passed through
 * unchanged. Every other error is normalised to:
 *
 *   { status_code, message, error, request_id }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const request_id = crypto.randomUUID();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Pass validation errors through untouched (they already carry `errors`).
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (this.isValidationError(res)) {
        logger.error(
          res,
          `validation error for ${request.method} ${request.url}`,
        );
        response.status(status).json(res);
        return;
      }
    }

    const { message, error } = this.buildPayload(exception, status);

    const body: ErrorResponse = {
      status_code: status,
      message,
      error,
      request_id,
    };

    logger.error(
      body,
      `error for request_id: ${request_id} : ${request.method} ${request.url} : ${
        exception instanceof Error ? exception.stack : String(exception)
      }`,
    );

    response.status(status).json(body);
  }

  private isValidationError(res: string | object): res is Record<string, any> {
    return typeof res === 'object' && res !== null && 'errors' in res;
  }

  private buildPayload(
    exception: unknown,
    status: number,
  ): { message: string; error: string } {
    const fallback = this.reasonPhrase(status);

    if (exception instanceof HttpException) {
      const res = exception.getResponse();

      if (typeof res === 'string') {
        return { message: res, error: fallback };
      }

      const r = res as Record<string, any>;
      const rawMessage = r.message ?? exception.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : String(rawMessage ?? fallback);
      const error = typeof r.error === 'string' ? r.error : fallback;

      return { message, error };
    }

    // Unknown / unhandled errors are surfaced as a generic 500.
    return { message: 'Internal server error', error: fallback };
  }

  private reasonPhrase(status: number): string {
    return REASON_PHRASES[status] ?? HttpStatus[status] ?? 'Error';
  }
}
