import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { cacheConfig } from './cache-redis.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, cacheConfig],
    }),
  ],
})
export class ConfigModule {}
