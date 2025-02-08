import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
    this.logger.log('Creating/extending subscription for user:', dto.userId);
    return this.paymentService.createSubscription(dto.userId, dto.planType);
  }

  @Get('current-plan/:userId')
  @UseGuards(JwtStrategy)
  async getCurrentPlan(@Param('userId', ParseIntPipe) userId: number) {
    this.logger.log(`Fetching subscription info for user: ${userId}`);
    const subscriptionInfo = await this.paymentService.getCurrentPlan(userId);

    if (!subscriptionInfo) {
      throw new NotFoundException('No subscription found for this user');
    }

    return subscriptionInfo;
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

  @Get('subscriptions')
  @UseGuards(JwtStrategy)
  async getAllSubscriptions() {
    this.logger.log('Fetching all subscriptions');
    try {
      const subscriptions = await this.paymentService.getAllSubscriptions();
      return {
        success: true,
        data: subscriptions
      };
    } catch (error) {
      this.logger.error('Failed to fetch subscriptions:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}