import { PlanType } from '@prisma/client';
import { IsNumber, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNumber()
  userId: number;

  @IsEnum(PlanType)
  planType: PlanType;
}

export class UpdateSubscriptionDto {
  @IsEnum(PlanType)
  planType: PlanType;
}