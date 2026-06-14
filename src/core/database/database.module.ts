import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('database.host'),
        port: config.getOrThrow<number>('database.port'),
        username: config.getOrThrow<string>('database.username'),
        password: config.getOrThrow<string>('database.password'),
        database: config.getOrThrow<string>('database.name'),
        autoLoadEntities: true,
        synchronize: true,
        poolSize: 40,
      }),
    }),
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          stores: [new KeyvRedis(config.getOrThrow<string>('cache_redis.url'))],
          isGlobal: true,
          ttl: 60 * 60 * 24 * 1, // 1 day
          max: 1000, // 1000 items
          namespace:
            config.get<string>('cache_redis.namespace') || 'appifylab_api',
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheModule, CacheService],
})
export class DatabaseModule {}
