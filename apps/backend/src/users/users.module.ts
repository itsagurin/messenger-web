import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorsMiddleware, UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from "../prisma.service";

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})

export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}