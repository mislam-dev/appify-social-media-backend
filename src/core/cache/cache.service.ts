/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateByPrefix(prefix: string) {
    const multiStore = this.cacheManager;

    if (!multiStore.stores) return;

    const keyToDelete = new Set<string>();

    for (const store of multiStore.stores) {
      try {
        if (store.iterator) {
          for await (const [key] of store.iterator('')) {
            if ((key as string).startsWith(prefix))
              keyToDelete.add(key as string);
          }
        } else if ('keys' in store && typeof store.keys === 'function') {
          const keys = (await (store as any).keys()) as string[];
          for (const key of keys) {
            if (key.startsWith(prefix)) keyToDelete.add(key);
          }
        }
      } catch (error) {
        this.logger.error('error scanning store layer', error);
      }
    }
    const keys = Array.from(keyToDelete.keys());
    this.logger.debug(`[Invalidating cache for keys] ${keys.join(', ')}`);
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }

  static generateKey(url: string) {
    const [path, queryString] = url.split('?');

    const cleanPath = path.replace(/^\/|\/$/g, '').replace(/\//g, ':');

    // 2. Predictable Query: Sort the keys so order doesn't matter
    let cleanQuery = '';
    if (queryString) {
      const params = new URLSearchParams(queryString);
      params.sort(); // <-- This is the secret sauce
      cleanQuery =
        '-' + params.toString().replace(/&/g, '-').replace(/=/g, ':');
    }
    return `${cleanPath}${cleanQuery}`;
  }
}
