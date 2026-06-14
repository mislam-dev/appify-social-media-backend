import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { logger } from 'src/core/logger';

export const validationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const formattedError = errors.map((err) => {
      return {
        property: err.property,
        constraints: Object.values(err.constraints || {}),
      };
    });

    const request_id = crypto.randomUUID(); // todo: use short request id for logs and response

    logger.error(
      {
        request_id,
        status_code: 400,
        message: 'validation failed!',
        errors: formattedError,
      },
      `validation failed for request_id: ${request_id} : ${JSON.stringify(formattedError)}`,
    );

    return new BadRequestException({
      request_id,
      status_code: 400,
      message: 'validation failed!',
      errors: formattedError,
    });
  },
});
