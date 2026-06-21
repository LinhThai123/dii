import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ADMIN_API_PREFIX, MOBILE_API_PREFIX } from './common/constants/api.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: true, credentials: true });

  const mobileSwagger = new DocumentBuilder()
    .setTitle('Dii Mobile API')
    .setDescription('Mobile API — Phone, Google, Facebook auth')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const adminSwagger = new DocumentBuilder()
    .setTitle('Dii Admin API')
    .setDescription('Admin Dashboard API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const mobileDoc = SwaggerModule.createDocument(app, mobileSwagger, {
    include: [],
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs/mobile', app, mobileDoc);

  const adminDoc = SwaggerModule.createDocument(app, adminSwagger, {
    include: [],
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs/admin', app, adminDoc);

  const port = config.get<number>('app.port') ?? 3001;
  await app.listen(port);

  console.log(`Mobile API: http://localhost:${port}/${MOBILE_API_PREFIX}`);
  console.log(`Admin API:  http://localhost:${port}/${ADMIN_API_PREFIX}`);
  console.log(`Swagger:    http://localhost:${port}/docs/mobile`);
}

bootstrap();
