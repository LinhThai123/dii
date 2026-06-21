import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCoupleId(coupleId: string) {
    return this.prisma.message.findMany({
      where: { coupleId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(data: SendMessageDto & { senderId: string }) {
    return this.prisma.message.create({
      data: {
        coupleId: data.coupleId,
        senderId: data.senderId,
        content: data.content,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });
  }
}
