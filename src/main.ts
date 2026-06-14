import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger, LoggingInterceptor } from './core/logger';
import { setupSwagger } from './core/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger });
  const PORT = process.env.PORT ?? 3000;
  setupSwagger(app);

  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(PORT);
}
void bootstrap();
