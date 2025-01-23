import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
  ValidationPipe,
  UsePipes,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { JwtStrategy } from '../auth/jwt.strategy';

@Controller('payment')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-subscription')
  @UseGuards(JwtStrategy)
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
  ) {
    console.log('Received DTO:', dto);
    return this.paymentService.createSubscription(dto.userId, dto.planType);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    console.log('Incoming webhook:', {
      signature,
      body: req.body
    });
    const rawBody = Buffer.from(JSON.stringify(req.body));
    return this.paymentService.handleWebhook(signature, rawBody);
  }
}