import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  ValidationPipe,
  UsePipes,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private paymentService: PaymentService) {}

  @Post('create-subscription')
  @UseGuards(JwtStrategy)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    this.logger.log('Creating subscription for user:', dto.userId);
    return this.paymentService.createSubscription(dto.userId, dto.planType);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log('Webhook endpoint hit');
    this.logger.log(`Signature: ${signature}`);

    if (!req.rawBody) {
      this.logger.error('No raw body found in request');
      throw new Error('No raw body found in request');
    }

    this.logger.log(`Raw body length: ${req.rawBody.length}`);
    return this.paymentService.handleWebhook(signature, req.rawBody);
  }
}