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
  Logger, Header,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { JwtStrategy } from '../auth/jwt.strategy';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name); // Добавьте Logger

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
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
  ) {
    console.log('Received DTO:', dto);
    return this.paymentService.createSubscription(dto.userId, dto.planType);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any
  ) {
    return this.paymentService.handleWebhook(signature, req.rawBody);
  }

  private async streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    return Buffer.concat(chunks);
  }
}