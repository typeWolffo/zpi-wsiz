import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { patchNestJsSwagger, applyFormats } from 'nestjs-typebox';

import { AppModule } from './app.module';
import { exportSchemaToFile } from './utils/save-swagger-to-file';
import { setupValidation } from './utils/setup-validation';

patchNestJsSwagger();
applyFormats();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  setupValidation();
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('ZPI API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/swagger-json', (req, res) => {
    res.json(document);
  });

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  });
  exportSchemaToFile(document);

  await app.listen(3000);
}

bootstrap();
