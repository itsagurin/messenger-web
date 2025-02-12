import { Controller, Post, Body, Get, UseGuards, Param, BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return await this.messageService.sendMessage(createMessageDto);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllMessages() {
    return this.messageService.getAllMessages();
  }

  @Get('unread/:receiverId')
  @UseGuards(AuthGuard('jwt'))
  async getUnreadCount(@Param('receiverId') receiverId: string) {
    const receiverIdNum = parseInt(receiverId, 10);
    if (isNaN(receiverIdNum)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.messageService.getUnreadCount(receiverIdNum);
  }

  @Post('mark-read/:senderId/:receiverId')
  @UseGuards(AuthGuard('jwt'))
  async markMessagesAsRead(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ) {
    const senderIdNum = parseInt(senderId, 10);
    const receiverIdNum = parseInt(receiverId, 10);

    if (isNaN(senderIdNum)) {
      throw new BadRequestException(`Invalid senderId: ${senderId}`);
    }

    if (isNaN(receiverIdNum)) {
      throw new BadRequestException(`Invalid receiverId: ${receiverId}`);
    }

    await this.messageService.markMessagesAsRead(senderIdNum, receiverIdNum);
    return { success: true };
  }

  @Get('conversation/:currentUserId/:selectedUserId')
  @UseGuards(AuthGuard('jwt'))
  async getMessages(
    @Param('currentUserId') currentUserId: string,
    @Param('selectedUserId') selectedUserId: string
  ) {

    if (!currentUserId || !selectedUserId) {
      throw new BadRequestException('Both currentUserId and selectedUserId are required');
    }

    const currentUserIdNum = parseInt(currentUserId, 10);
    const selectedUserIdNum = parseInt(selectedUserId, 10);

    if (isNaN(currentUserIdNum)) {
      throw new BadRequestException(`Invalid currentUserId: ${currentUserId}`);
    }

    if (isNaN(selectedUserIdNum)) {
      throw new BadRequestException(`Invalid selectedUserId: ${selectedUserId}`);
    }

    if (currentUserIdNum <= 0 || selectedUserIdNum <= 0) {
      throw new BadRequestException('User IDs must be positive numbers');
    }

    return this.messageService.getMessagesForUser(currentUserIdNum, selectedUserIdNum);
  }
}