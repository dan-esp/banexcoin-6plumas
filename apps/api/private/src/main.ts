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
    .setTitle('BanexReintegra ETL API')
    .setDescription(
      'File ingestion and transformation layer for the BanexReintegra cashback system.\n\n' +
        '**Workflow:**\n' +
        '1. `POST /etl/upload/qr-payments` — upload your CSV or XLSX Pago QR file\n' +
        '2. `GET /etl/status` — confirm how many rows were loaded\n' +
        '3. `GET /etl/preview/qr-payments` — inspect the first 10 parsed rows\n' +
        '4. `DELETE /etl/clear/qr-payments` — reset the store when uploading a new file\n\n' +
        '**Supported entity types:** `qr-payments`\n\n' +
        '**Supported file formats:** CSV (UTF-8, comma-separated), XLSX',
    )
    .setVersion('1.0')
    .addTag('ETL — File Ingestion', 'Upload and inspect QR payment transaction files')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 3,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger UI available at: http://localhost:${port}/api/docs`);
}

bootstrap();
