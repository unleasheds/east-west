import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('create-intent')
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.svc.createPaymentIntent(dto);
  }

  // Stripe sends raw body — keep this route outside ValidationPipe
  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.svc.handleWebhook(req.rawBody as Buffer, sig);
  }
}
