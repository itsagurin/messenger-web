import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  // Отправка сообщения
  async sendMessage(createMessageDto: CreateMessageDto) {
    const { senderId, receiverId, text } = createMessageDto;

    // Сохраняем сообщение в базе данных
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
  async getMessagesForUser(userId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: true, // Включаем информацию об отправителе
        receiver: true, // Включаем информацию о получателе
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
}