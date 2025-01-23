import { PlanType } from '@prisma/client';
import { IsNumber, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(PlanType)
  @IsNotEmpty()
  planType: PlanType;
}

export class UpdateSubscriptionDto {
  @IsEnum(PlanType)
  @IsNotEmpty()
  planType: PlanType;
}