import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly stripe: any;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(this.config.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const intent = await this.stripe.paymentIntents.create({
      amount: dto.amount,
      currency: dto.currency ?? 'usd',
      description: dto.description,
      metadata: dto.metadata ?? {},
      automatic_payment_methods: { enabled: true },
    });

    return { clientSecret: intent.client_secret };
  }

  async handleWebhook(payload: Buffer, sig: string) {
    const webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    const event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        // TODO: update booking status in DB
        break;
      case 'payment_intent.payment_failed':
        // TODO: notify customer
        break;
    }

    return { received: true };
  }
}
