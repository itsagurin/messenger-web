import { Controller, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CreateSubscriptionDto } from './dto/subscription.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-subscription')
  @UseGuards(JwtStrategy)
  async createSubscription(
    @Req() req,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.paymentService.createSubscription(req.user.id, dto.planType);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.paymentService.handleWebhook(signature, request.rawBody);
  }
}