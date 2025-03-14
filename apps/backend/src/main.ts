import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { json } from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  app.use(cors({
    origin: configService.get('FRONTEND_URL'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use((req, res, next) => {
    if (req.path === '/payment/webhook') {
      next();
    } else {
      json()(req, res, next);
    }
  });

  await app.listen(4000);
}
bootstrap();