import { Controller, Post, Body, Get, UseGuards, Param, ParseIntPipe, HttpCode } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return await this.messageService.sendMessage(createMessageDto);
  }

  @Get('all')
  async getAllMessages() {
    return this.messageService.getAllMessages();
  }

  @Get('unread/:receiverId')
  async getUnreadCount(@Param('receiverId', ParseIntPipe) receiverId: number) {
    return this.messageService.getUnreadCount(receiverId);
  }

  @Post('mark-read/:senderId/:receiverId')
  @HttpCode(204)
  async markMessagesAsRead(
    @Param('senderId', ParseIntPipe) senderId: number,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ) {
    await this.messageService.markMessagesAsRead(senderId, receiverId);
  }

  @Get('conversation/:currentUserId/:selectedUserId')
  async getMessages(
    @Param('currentUserId', ParseIntPipe) currentUserId: number,
    @Param('selectedUserId', ParseIntPipe) selectedUserId: number,
  ) {
    return this.messageService.getMessagesForUser(currentUserId, selectedUserId);
  }
}