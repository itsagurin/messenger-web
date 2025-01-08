import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return await this.messageService.sendMessage(createMessageDto);
  }

  @Get(':currentUserId/:selectedUserId')
  async getMessages(@Param() params: { currentUserId: string, selectedUserId: string }) {
    const { currentUserId, selectedUserId } = params;
    const currentUserIdNum = parseInt(currentUserId, 10);
    const selectedUserIdNum = parseInt(selectedUserId, 10);

    if (isNaN(currentUserIdNum) || isNaN(selectedUserIdNum)) {
      throw new Error('Invalid user IDs');
    }

    return this.messageService.getMessagesForUser(currentUserIdNum, selectedUserIdNum);
  }


  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllMessages() {
    return this.messageService.getAllMessages();
  }
}
