import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from "./http-exception.filter";
import { CorsMiddleware } from './users/users.service';
import { MessageModule } from './message/message.module';
import { PrismaService } from './prisma.service';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: '.env.local',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        DATABASE_URL: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        STRIPE_WEBHOOK_SECRET: Joi.string().required(),
        STRIPE_BASIC_PRICE_ID: Joi.string().required(),
        STRIPE_PLUS_PRICE_ID: Joi.string().required(),
        STRIPE_PREMIUM_PRICE_ID: Joi.string().required(),
        STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        STRIPE_API_VERSION: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),
    UsersModule,
    MessageModule,
    PaymentModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    PrismaService,
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}