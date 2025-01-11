import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from "./http-exception.filter";
import { CorsMiddleware } from './users/users.service';
import { MessageModule } from './message/message.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [UsersModule, MessageModule],
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