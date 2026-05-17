import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BanexReintegra Private API')
    .setDescription(
      'Internal API for deterministic BanexReintegra ETL, validation, cashback review, approval, and export workflows.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Service status and readiness checks')
    .addTag('auth', 'Authenticated session inspection')
    .addTag('ETL — File Ingestion', 'Upload and inspect QR payment transaction files')
    .addTag('Processing — Cashback Calculation', 'Calculate and review payout results')
    .addTag('batches', 'Batch processing, storage, and export workflows')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 3,
    },
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger UI available at: http://localhost:${port}/api/docs`);
}

void bootstrap();
