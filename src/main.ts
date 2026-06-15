import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters';
import { TransformInterceptor } from './core/interceptors';
import { logger, LoggingInterceptor } from './core/logger';
import { validationPipe } from './core/pipes/validation.pipe';
import { setupSwagger } from './core/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger });
  const PORT = process.env.PORT ?? 4000;

  app.enableCors({ origin: '*' });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(validationPipe);

  app.useGlobalFilters(new HttpExceptionFilter());

  setupSwagger(app);

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  await app.listen(PORT);
}
void bootstrap();
