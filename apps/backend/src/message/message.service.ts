import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(createMessageDto: CreateMessageDto) {
    const { senderId, receiverId, text } = createMessageDto;

    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        status: 'sent',
      },
    });

    return message;
  }

  async getMessagesForUser(currentUserId: number, selectedUserId: number) {
    return this.prisma.message.findMany({
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
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        status: 'sent',
      },
      data: {
        status: 'read',
      },
    });
  }

  async getUnreadCount(receiverId: number): Promise<{ [key: number]: number }> {
    const messages = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId,
        status: 'sent',
      },
      _count: {
        senderId: true,
      },
    });

    const unreadCount = messages.reduce((acc, group) => {
      acc[group.senderId] = group._count.senderId;
      return acc;
    }, {} as { [key: number]: number });

    return unreadCount;
  }

  async getAllMessages() {
    return this.prisma.message.findMany({
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

}