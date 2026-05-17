import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BanexReintegra Private API')
    .setDescription(
      'Internal API for deterministic BanexReintegra ETL, validation, cashback review, approval, and export workflows.',
    )
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('health', 'Service status and readiness checks')
    .addTag('auth', 'Authenticated session inspection')
    .addServer('/', 'Current private API origin')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
