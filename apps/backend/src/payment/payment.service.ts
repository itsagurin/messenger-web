import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PlanType, SubStatus, User } from '@prisma/client';
import { SUBSCRIPTION_PLANS } from './constants/plans.constant';

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

  async createSubscription(userId: number, planType: PlanType) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new Error('User not found');

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

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: SUBSCRIPTION_PLANS[planType].stripeId,
        quantity: 1,
      }],
      success_url: `${this.config.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/payment/cancel`,
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
      console.log('Signature:', signature);
      console.log('Payload:', payload.toString());

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      console.log('Event type:', event.type);
      console.log('Event data:', JSON.stringify(event.data));

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.handleCheckoutCompleted(session);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionDeleted(subscription);
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.handleSubscriptionUpdated(subscription);
          break;
        }
      }

      return { received: true };
    } catch (err) {
      console.error('Webhook error details:', err);
      throw err;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: session.customer as string },
    });

    if (!subscription) {
      this.logger.error(`No subscription found for customer: ${session.customer}`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubStatus.ACTIVE,
        stripeSubscriptionId: session.subscription as string,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: SubStatus.CANCELED,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
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