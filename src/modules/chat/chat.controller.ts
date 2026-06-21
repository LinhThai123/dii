import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  getMessages(@Query('coupleId') coupleId: string) {
    return this.chatService.getMessages(coupleId);
  }
}
