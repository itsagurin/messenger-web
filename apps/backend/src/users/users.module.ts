import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorsMiddleware, UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from "../prisma.service";
import { UsersGateway } from "../websocket/wsgateway";

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UsersGateway],
})

export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}