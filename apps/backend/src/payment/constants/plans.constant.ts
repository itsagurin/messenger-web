import { ConfigService } from '@nestjs/config';

export const SUBSCRIPTION_PLANS = (configService: ConfigService) => ({
  BASIC: {
    name: 'Basic',
    price: 0,
    features: ['messaging', 'team meeting', '5 TB storage'],
    stripeId: configService.get('STRIPE_BASIC_PRICE_ID')
  },
  PLUS: {
    name: 'Plus',
    price: 5,
    features: ['All Basic features', 'message scheduling', '15 TB storage'],
    stripeId: configService.get('STRIPE_PLUS_PRICE_ID')
  },
  PREMIUM: {
    name: 'Premium',
    price: 10,
    features: ['All Plus features', 'special emoji', 'unlimited storage'],
    stripeId: configService.get('STRIPE_PREMIUM_PRICE_ID')
  }
});