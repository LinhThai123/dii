import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateMemoryDto } from './dto/create-memory.dto';

@Injectable()
export class MemoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCoupleId(coupleId: string) {
    return this.prisma.memory.findMany({
      where: { coupleId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        photos: true,
      },
      orderBy: { memoryAt: 'desc' },
    });
  }

  create(data: CreateMemoryDto & { authorId: string }) {
    return this.prisma.memory.create({
      data: {
        coupleId: data.coupleId,
        authorId: data.authorId,
        title: data.title,
        content: data.content,
        placeId: data.placeId,
        memoryAt: data.memoryAt ? new Date(data.memoryAt) : undefined,
      },
    });
  }
}
