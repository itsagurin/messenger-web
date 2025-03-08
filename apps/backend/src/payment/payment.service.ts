import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PlanType, SubStatus } from '@prisma/client';
import { SUBSCRIPTION_PLANS } from './constants/plans.constant';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PaymentService implements OnModuleInit {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);
  private frontendUrl: string;
  private plans: ReturnType<typeof SUBSCRIPTION_PLANS>;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const stripeKey = this.config.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: this.config.get('STRIPE_API_VERSION'),
    });

    this.plans = SUBSCRIPTION_PLANS(this.config);
  }

  onModuleInit() {
    const requiredConfigs = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'FRONTEND_URL',
      'STRIPE_BASIC_PRICE_ID',
      'STRIPE_PLUS_PRICE_ID',
      'STRIPE_PREMIUM_PRICE_ID'
    ];

    for (const config of requiredConfigs) {
      const value = this.config.get(config);
      if (!value) {
        throw new Error(`${config} is not configured`);
      }
    }

    this.frontendUrl = this.config.get('FRONTEND_URL');
    this.logger.log(`Initialized PaymentService with frontend URL: ${this.frontendUrl}`);

    Object.entries(this.plans).forEach(([planName, plan]) => {
      this.logger.log(`Plan ${planName} has Stripe ID: ${plan.stripeId}`);
      if (!plan.stripeId) {
        throw new Error(`Stripe ID for plan ${planName} is not configured`);
      }
    });
  }

  @Cron('0 0 * * *')
  async checkExpiredSubscriptions() {
    const now = new Date();

    await this.prisma.subscription.updateMany({
      where: {
        planType: PlanType.BASIC,
        currentPeriodEnd: { lte: now },
        status: SubStatus.ACTIVE,
      },
      data: {
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const expiredPaidSubscriptions = await this.prisma.subscription.findMany({
      where: {
        currentPeriodEnd: { lte: now },
        planType: { not: PlanType.BASIC },
        status: SubStatus.ACTIVE,
      },
    });

    for (const subscription of expiredPaidSubscriptions) {
      if (subscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await this.stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
          );

          if (stripeSubscription.status === 'active') {
            await this.prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              },
            });
            continue;
          }
        } catch (error) {
          this.logger.error(`Failed to check Stripe subscription: ${error.message}`);
        }
      }

      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planType: PlanType.BASIC,
          status: SubStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          stripeSubscriptionId: null,
        },
      });
    }
  }

  async createSubscription(userId: number, planType: PlanType) {
    this.logger.log(`Creating subscription for user ${userId} with plan ${planType}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (planType === PlanType.BASIC) {
      const now = new Date();
      return this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          planType,
          status: SubStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
          planType,
          status: SubStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id.toString() },
      });
      stripeCustomerId = customer.id;

      if (user.subscription) {
        await this.prisma.subscription.update({
          where: { userId: user.id },
          data: { stripeCustomerId },
        });
      }
    }

    const successUrl = new URL('/payment/success', this.frontendUrl);
    successUrl.searchParams.append('session_id', '{CHECKOUT_SESSION_ID}');
    const cancelUrl = new URL('/payment/cancel', this.frontendUrl);

    const stripeId = this.plans[planType].stripeId;
    if (!stripeId) {
      throw new Error(`Missing Stripe price ID for plan ${planType}`);
    }

    this.logger.log(`Using Stripe price ID for ${planType}: ${stripeId}`);

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: stripeId,
        quantity: 1,
      }],
      metadata: {
        userId: user.id.toString(),
        planType,
      },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async getCurrentPlan(userId: number) {
    this.logger.log(`Getting current plan for user ${userId}`);

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      select: {
        planType: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        stripeSubscriptionId: true,
      },
    });

    if (!subscription) {
      return null;
    }

    let stripeSubscriptionDetails = null;
    if (subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );
        stripeSubscriptionDetails = {
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          created: new Date(stripeSubscription.created * 1000),
        };
      } catch (error) {
        this.logger.error(`Failed to fetch Stripe subscription details: ${error.message}`);
      }
    }

    return {
      plan: subscription.planType,
      status: subscription.status,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      ...stripeSubscriptionDetails && { stripeDetails: stripeSubscriptionDetails },
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      this.logger.log(`Processing webhook event type: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      throw error;
    }
  }

  async getAllSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (!session.metadata?.userId) {
      throw new Error('No userId in session metadata');
    }

    const userId = Number(session.metadata.userId);
    const planType = session.metadata.planType as PlanType;
    const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planType,
        status: SubStatus.ACTIVE,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      update: {
        planType,
        status: SubStatus.ACTIVE,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await this.stripe.customers.retrieve(invoice.customer as string);
    const userId = Number((customer as Stripe.Customer).metadata.userId);

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: SubStatus.ACTIVE,
      },
    });
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await this.stripe.customers.retrieve(invoice.customer as string);
    const userId = Number((customer as Stripe.Customer).metadata.userId);

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: SubStatus.PAST_DUE,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customer = await this.stripe.customers.retrieve(subscription.customer as string);
    const userId = Number((customer as Stripe.Customer).metadata.userId);
    const now = new Date();

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        planType: PlanType.BASIC,
        status: SubStatus.ACTIVE,
        stripeSubscriptionId: null,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
}