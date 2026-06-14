import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/authentication/auth/auth.module';
import { ConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, ModulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
