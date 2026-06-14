import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache_redis', () => ({
  url: process.env.CACHE_URL,
  namespace: process.env.CACHE_NAMESPACE,
}));
