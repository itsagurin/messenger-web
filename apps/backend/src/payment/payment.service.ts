import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PlanType, User } from '@prisma/client';
import { SUBSCRIPTION_PLANS } from './constants/plans.constant';

type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'PAST_DUE' | 'UNPAID';

interface ExtendedUser extends User {
  stripeCustomerId?: string;
  name?: string;
}

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createCustomerIfNotExists(user: ExtendedUser) {
    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id.toString(),
        },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customer.id,
        } as any,
      });

      return customer.id;
    }
    return user.stripeCustomerId;
  }

  async createSubscription(userId: number, planType: PlanType) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    }) as ExtendedUser;

    const customerId = await this.createCustomerIfNotExists(user);
    const plan = SUBSCRIPTION_PLANS[planType];

    if (planType === 'BASIC') {
      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planType,
          status: 'ACTIVE',
        },
        update: {
          planType,
          status: 'ACTIVE',
        },
      });
      return { success: true };
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripeId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planType,
        stripeSubscriptionId: subscription.id,
        status: 'INCOMPLETE',
      },
      update: {
        planType,
        stripeSubscriptionId: subscription.id,
        status: 'INCOMPLETE',
      },
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhook = this.config.get('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhook);

      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdate(subscription);
          break;
      }

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private async handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription) {
    const user = await this.prisma.user.findFirst({
      where: {
        stripeCustomerId: stripeSubscription.customer as string,
      } as any,
    });

    if (!user) return;

    await this.prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'ACTIVE',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      past_due: 'PAST_DUE',
      unpaid: 'UNPAID',
    };
    return statusMap[stripeStatus] || 'INCOMPLETE';
  }
}