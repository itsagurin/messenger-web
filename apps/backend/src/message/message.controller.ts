import { Controller, Post, Body, Get } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return await this.messageService.sendMessage(createMessageDto);
  }

  @Get(':userId')
  async getMessages(@Body() userId: number) {
    return await this.messageService.getMessagesForUser(userId);
  }
}
