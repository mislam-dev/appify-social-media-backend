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
      customCss: `
        .swagger-ui { background-color: #1b1b1b; color: #eee; }
        .swagger-ui .topbar { background-color: #000; border-bottom: 2px solid #333; }
        .swagger-ui .info .title, .swagger-ui .info li, .swagger-ui .info p, .swagger-ui .info table, 
        .swagger-ui .opblock .opblock-summary-description, .swagger-ui .opblock-tag, 
        .swagger-ui .opblock-tag p, .swagger-ui .opblock-title_normal, .swagger-ui .opblock-section-header h4,
        .swagger-ui .parameters-col_name, .swagger-ui .parameter__name, .swagger-ui .parameter__type,
        .swagger-ui .parameter__in, .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5,
        .swagger-ui .response-col_status, .swagger-ui .response-col_links, .swagger-ui .model-title,
        .swagger-ui .tabli button, .swagger-ui .model { color: #eee !important; }
        .swagger-ui .scheme-container { background-color: #222; box-shadow: 0 1px 2px 0 rgba(255,255,255,.15); }
        .swagger-ui .opblock { background: #2b2b2b; border: 1px solid #444; }
        .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-operation-id { color: #eee !important; }
        .swagger-ui section.models { border: 1px solid #444; }
        .swagger-ui section.models .model-container { background: #222; }
        .swagger-ui section.models h4 { color: #eee; }
        .swagger-ui .btn.authorize { background-color: #49cc90; color: #fff; border-color: #49cc90; }
        .swagger-ui .btn.authorize svg { fill: #fff; }
        .swagger-ui .expand-methods, .swagger-ui .expand-operation { fill: #eee; }
        .swagger-ui select { background: #333; color: #eee; border-color: #444; }
        .swagger-ui table thead tr td, .swagger-ui table thead tr th { border-bottom: 1px solid #444; color: #eee; }
        .swagger-ui .opblock-section-header { background: #333; }
        .swagger-ui .opblock .opblock-summary-description { color: #aaa !important; }
      `,
      customSiteTitle: 'Academic MS API Docs',
    });
  } else {
    logger.warn(`Swagger YAML file not found at ${swaggerFile}`);
  }
}
