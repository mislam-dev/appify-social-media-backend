import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { TransformInterceptor } from './core/interceptors';
import { logger, LoggingInterceptor } from './core/logger';
import { validationPipe } from './core/pipes/validation.pipe';
import { setupSwagger } from './core/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger });
  const PORT = process.env.PORT ?? 3000;

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(validationPipe);

  setupSwagger(app);

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  await app.listen(PORT);
}
void bootstrap();
