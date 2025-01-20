import { PlanType } from '@prisma/client';

export class CreateSubscriptionDto {
  planType: PlanType;
}

export class UpdateSubscriptionDto {
  planType: PlanType;
}