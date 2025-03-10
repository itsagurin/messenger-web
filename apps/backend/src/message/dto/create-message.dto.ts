import { IsNotEmpty, IsNumber, IsString, Min, IsPositive } from 'class-validator';

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
}