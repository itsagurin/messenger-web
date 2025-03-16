import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageStatus } from '@prisma/client';
import { Message } from '@messenger/shared';

export type UnreadCountMap = { [key: number]: number };

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const { senderId, receiverId, text, status = MessageStatus.SENT } = createMessageDto;

      const message = await this.prisma.message.create({
        data: {
          senderId,
          receiverId,
          text,
          status,
        },
      });

      this.logger.log(`Message sent from user ${senderId} to user ${receiverId}`);
      return message;
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMessagesForUser(currentUserId: number, selectedUserId: number): Promise<Message[]> {
    try {
      if (currentUserId <= 0 || selectedUserId <= 0) {
        this.logger.error(`Invalid user IDs: ${currentUserId}, ${selectedUserId}`);
        throw new BadRequestException('User IDs must be positive numbers');
      }

      const messages = await this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: selectedUserId },
            { senderId: selectedUserId, receiverId: currentUserId },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      this.logger.log(`Retrieved ${messages.length} messages between users ${currentUserId} and ${selectedUserId}`);
      return messages;
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        this.logger.error(`Failed to get messages: ${error.message}`, error.stack);
      }
      throw error;
    }
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    try {
      await this.prisma.message.updateMany({
        where: {
          senderId,
          receiverId,
          status: MessageStatus.SENT,
        },
        data: {
          status: MessageStatus.READ,
        },
      });
      this.logger.log(`Marked messages as read from sender ${senderId} to receiver ${receiverId}`);
    } catch (error) {
      this.logger.error(`Failed to mark messages as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUnreadCount(receiverId: number): Promise<UnreadCountMap> {
    try {
      const messages = await this.prisma.message.groupBy({
        by: ['senderId'],
        where: {
          receiverId,
          status: MessageStatus.SENT,
        },
        _count: {
          senderId: true,
        },
      });

      const unreadCount = messages.reduce((acc, group) => {
        acc[group.senderId] = group._count.senderId;
        return acc;
      }, {} as UnreadCountMap);

      this.logger.log(`Retrieved unread count for receiver ${receiverId}`);
      return unreadCount;
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllMessages(): Promise<Message[]> {
    try {
      const messages = await this.prisma.message.findMany({
        include: {
          sender: true,
          receiver: true,
        },
      });
      this.logger.log(`Retrieved all messages, count: ${messages.length}`);
      return messages;
    } catch (error) {
      this.logger.error(`Failed to get all messages: ${error.message}`, error.stack);
      throw error;
    }
  }
}