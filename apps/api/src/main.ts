import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Pipes عالمشروع
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Swagger (محمي بـ try/catch حتى ما يوقف السيرفر لو صار خطأ بتجميع الـ metadata)
  try {
    const config = new DocumentBuilder()
      .setTitle('TijaraLink API')
      .setDescription('REST endpoints for TijaraLink')
      .setVersion('0.1.0')
      .build();

    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, doc, {
      swaggerOptions: { persistAuthorization: true },
    });

    console.log(`Swagger UI on http://localhost:${process.env.PORT || 3001}/docs`);
  } catch (e: any) {
    console.warn('Swagger disabled:', e?.message || e);
  }

  await app.listen(process.env.PORT || 3001);
  console.log(`API on http://localhost:${process.env.PORT || 3001}`);
}
bootstrap();
