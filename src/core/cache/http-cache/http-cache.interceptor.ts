/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheService } from '../cache.service';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;
    const url: string = httpAdapter.getRequestUrl(request);

    const requestMethod = httpAdapter.getRequestMethod(request);
    if (requestMethod !== 'GET') {
      return undefined;
    }

    const cacheMetadata = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    if (cacheMetadata) {
      return cacheMetadata;
    }

    const key = CacheService.generateKey(url);

    return key;
  }
}
