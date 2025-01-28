import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PlanType, SubStatus } from '@prisma/client';
import { SUBSCRIPTION_PLANS } from './constants/plans.constant';

@Injectable()
export class PaymentService implements OnModuleInit {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);
  private frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const stripeKey = this.config.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  onModuleInit() {
    const requiredConfigs = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'FRONTEND_URL'
    ];

    for (const config of requiredConfigs) {
      const value = this.config.get(config);
      if (!value) {
        throw new Error(`${config} is not configured`);
      }
    }

    this.frontendUrl = this.config.get('FRONTEND_URL');
    this.logger.log(`Initialized PaymentService with frontend URL: ${this.frontendUrl}`);
  }

  async createSubscription(userId: number, planType: PlanType) {
    this.logger.log(`Creating subscription for user ${userId} with plan ${planType}`);

    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id.toString() },
      });
      stripeCustomerId = customer.id;
    }

    if (planType === PlanType.BASIC) {
      await this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          planType,
          status: SubStatus.ACTIVE,
          stripeCustomerId,
        },
        update: {
          planType,
          status: SubStatus.ACTIVE,
          stripeCustomerId,
        },
      });
      return { success: true };
    }

    const successUrl = new URL('/payment/success', this.frontendUrl);
    successUrl.searchParams.append('session_id', '{CHECKOUT_SESSION_ID}');

    const cancelUrl = new URL('/payment/cancel', this.frontendUrl);

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: SUBSCRIPTION_PLANS[planType].stripeId,
        quantity: 1,
      }],
      metadata: {
        userId: user.id.toString(),
      },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });

    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        planType,
        stripeCustomerId,
        status: SubStatus.INCOMPLETE,
      },
      update: {
        planType,
        stripeCustomerId,
        status: SubStatus.INCOMPLETE,
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');

    try {
      this.logger.log('Processing webhook with secret');

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      this.logger.log(`Processing webhook event type: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          this.logger.log('Processing completed checkout session:', session.id);
          await this.processCheckoutCompleted(session);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          this.logger.log('Processing subscription update:', subscription.id);
          await this.handleSubscriptionUpdated(subscription);
          break;
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          this.logger.log('Processing subscription deletion:', deletedSubscription.id);
          await this.handleSubscriptionDeleted(deletedSubscription);
          break;
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      throw error;
    }
  }

  private async processCheckoutCompleted(session: Stripe.Checkout.Session) {
    this.logger.log('Processing checkout completion');

    if (!session.metadata?.userId) {
      this.logger.error('No userId in session metadata');
      throw new Error('No userId in session metadata');
    }

    const userId = Number(session.metadata.userId);

    try {
      const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

      await this.prisma.subscription.update({
        where: { userId },
        data: {
          status: SubStatus.ACTIVE,
          stripeSubscriptionId: session.subscription as string,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        }
      });
      this.logger.log(`Successfully updated subscription for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update subscription for user ${userId}:`, error);
      throw error;
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const status = this.mapStripeStatus(subscription.status);
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
    this.logger.log(`Updated subscription ${subscription.id} status to ${status}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: SubStatus.CANCELED,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
    this.logger.log(`Marked subscription ${subscription.id} as canceled`);
  }

  private mapStripeStatus(stripeStatus: string): SubStatus {
    const statusMap: Record<string, SubStatus> = {
      active: SubStatus.ACTIVE,
      canceled: SubStatus.CANCELED,
      incomplete: SubStatus.INCOMPLETE,
      past_due: SubStatus.PAST_DUE,
      unpaid: SubStatus.UNPAID,
    };
    return statusMap[stripeStatus] || SubStatus.INCOMPLETE;
  }
}