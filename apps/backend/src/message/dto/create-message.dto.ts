import { IsNotEmpty, IsNumber, IsString, IsPositive, IsEnum } from 'class-validator';
import { MessageStatus } from '@prisma/client';

export class CreateMessageDto {
  @IsNumber()
  @IsPositive()
  senderId: number;

  @IsNumber()
  @IsPositive()
  receiverId: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsEnum(MessageStatus)
  status?: MessageStatus;
}