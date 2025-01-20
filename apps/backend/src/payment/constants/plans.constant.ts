export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 0,
    features: ['messaging', 'team meeting', '5 TB storage'],
    stripeId: process.env.STRIPE_BASIC_PRICE_ID
  },
  PLUS: {
    name: 'Plus',
    price: 5,
    features: ['All Basic features', 'message scheduling', '15 TB storage'],
    stripeId: process.env.STRIPE_PLUS_PRICE_ID
  },
  PREMIUM: {
    name: 'Premium',
    price: 10,
    features: ['All Plus features', 'special emoji', 'unlimited storage'],
    stripeId: process.env.STRIPE_PREMIUM_PRICE_ID
  }
};