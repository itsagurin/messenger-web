import {
  Body,
  Controller,
  Get,
  Headers,
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
    return this.paymentService.createSubscription(dto.userId, dto.planType);
  }

  @Get('current-plan/:userId')
  @UseGuards(JwtStrategy)
  async getCurrentPlan(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentService.getCurrentPlan(userId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentService.handleWebhook(signature, req.rawBody);
  }

  @Get('subscriptions')
  @UseGuards(JwtStrategy)
  async getAllSubscriptions() {
    return this.paymentService.getAllSubscriptions();
  }
}