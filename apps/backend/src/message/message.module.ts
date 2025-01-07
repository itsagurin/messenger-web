import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
})
export class MessageModule {}
