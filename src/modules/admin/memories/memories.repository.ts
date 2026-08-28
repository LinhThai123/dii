import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const memorySelect = {
  id: true,
  coupleId: true,
  authorId: true,
  datePlanId: true,
  placeId: true,
  title: true,
  content: true,
  memoryAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, email: true, phone: true } },
  couple: { select: { id: true, inviteCode: true } },
  place: { select: { id: true, name: true } },
  _count: { select: { photos: true } },
} satisfies Prisma.MemorySelect;

@Injectable()
export class MemoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: {
    skip: number;
    take: number;
    coupleId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: Prisma.MemoryWhereInput = {};
    if (params.coupleId) where.coupleId = params.coupleId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.dateFrom || params.dateTo) {
      where.memoryAt = {};
      if (params.dateFrom) {
        where.memoryAt.gte = new Date(`${params.dateFrom}T00:00:00.000Z`);
      }
      if (params.dateTo) {
        where.memoryAt.lte = new Date(`${params.dateTo}T23:59:59.999Z`);
      }
    }

    return this.prisma.$transaction([
      this.prisma.memory.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { memoryAt: 'desc' },
        select: memorySelect,
      }),
      this.prisma.memory.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.memory.findUnique({
      where: { id },
      select: {
        ...memorySelect,
        photos: {
          select: { id: true, s3Url: true, caption: true, createdAt: true },
        },
      },
    });
  }

  delete(id: string) {
    return this.prisma.memory.delete({
      where: { id },
      select: { id: true, title: true, coupleId: true },
    });
  }
}
