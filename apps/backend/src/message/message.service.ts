import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  // Отправка сообщения
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

  // Получаем все сообщения для пользователя
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

  // Обновляем статус сообщения на "прочитано"
  async markMessageAsRead(messageId: number) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { status: 'read' },
    });
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