/* eslint-disable @typescript-eslint/no-misused-promises */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { CacheService } from '../cache.service';

@Injectable()
export class InvalidationInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(async () => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
          const path = request.url;
          const key = CacheService.generateKey(path);
          if (path) {
            await this.cacheService.invalidateByPrefix(key);
          }
        }
      }),
    );
  }
}
