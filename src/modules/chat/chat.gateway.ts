import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { coupleId: string },
  ) {
    client.join(`couple:${data.coupleId}`);
    return { event: 'joined', coupleId: data.coupleId };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: SendMessageDto & { senderId: string },
  ) {
    const message = await this.chatService.sendMessage(data.senderId, data);
    this.server
      .to(`couple:${data.coupleId}`)
      .emit('newMessage', message);
    return message;
  }
}
