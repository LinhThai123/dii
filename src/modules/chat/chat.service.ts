import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  getMessages(coupleId: string) {
    return this.chatRepository.findByCoupleId(coupleId);
  }

  sendMessage(senderId: string, dto: SendMessageDto) {
    return this.chatRepository.create({ ...dto, senderId });
  }
}
