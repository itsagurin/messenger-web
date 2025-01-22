import { Controller, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-subscription')
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Req() req,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.paymentService.createSubscription(req.user.userId, dto.planType);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request,
  ) {
    return this.paymentService.handleWebhook(signature, request.body);
  }
}