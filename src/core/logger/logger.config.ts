/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
export const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, ms, stack }: any) => {
            const displayMessage = stack || message;
            const ctx = context || 'App';

            return `[${timestamp}] ${level}: [${ctx}] ${displayMessage} ${ms}`;
          },
        ),
      ),
    }),
  ],
});
