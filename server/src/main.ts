import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — allow Vite dev server, production domains and Railway frontend
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = [
    'http://localhost:5173',
    'https://eastwesthalaltravel.com',
    'https://www.eastwesthalaltravel.com',
    ...(frontendUrl ? [frontendUrl] : []),
  ];
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 EastWest API running on http://localhost:${port}/api`);
}

bootstrap();
