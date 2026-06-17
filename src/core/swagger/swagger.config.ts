import { INestApplication, Logger } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export function setupSwagger(
  app: INestApplication,
  url: string = '/docs',
): void {
  const logger = new Logger('SwaggerSetup');
  const swaggerFile = path.join(__dirname, 'swagger.yaml');
  if (fs.existsSync(swaggerFile)) {
    const files = fs.readFileSync(swaggerFile, 'utf8');
    const document: OpenAPIObject = yaml.load(files) as OpenAPIObject;
    SwaggerModule.setup(url, app, document, {
      customCssUrl:
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
      customJs: [
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
        'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
      ],
    });
  } else {
    logger.warn(`Swagger YAML file not found at ${swaggerFile}`);
  }
}
