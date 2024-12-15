import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CorsMiddleware, UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from "../prisma.service";
import { UsersGateway } from "../websocket/wsgateway";
import { JwtStrategy } from '../auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, UsersGateway, JwtStrategy],
})

export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}