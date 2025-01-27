import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { StripeWebhookMiddleware } from './middleware/stripe-webhook.middleware';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StripeWebhookMiddleware)
      .forRoutes({
        path: 'payment/webhook',
        method: RequestMethod.POST
      });
  }
}