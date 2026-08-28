import { Injectable } from '@nestjs/common';
import { CoupleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const coupleListSelect = {
  id: true,
  inviteCode: true,
  status: true,
  anniversaryDate: true,
  relationshipStatus: true,
  createdAt: true,
  updatedAt: true,
  members: {
    select: {
      userId: true,
      joinedAt: true,
      user: {
        select: { id: true, name: true, email: true, phone: true, status: true },
      },
    },
  },
  _count: {
    select: {
      datePlans: true,
      memories: true,
      messages: true,
      albums: true,
    },
  },
} satisfies Prisma.CoupleSelect;

const coupleDetailSelect = {
  ...coupleListSelect,
  favorites: {
    select: {
      id: true,
      placeId: true,
      createdAt: true,
      place: { select: { id: true, name: true, category: true } },
    },
    take: 20,
  },
  memories: {
    orderBy: { memoryAt: 'desc' as const },
    take: 8,
    select: {
      id: true,
      title: true,
      memoryAt: true,
      place: { select: { id: true, name: true, category: true } },
      photos: { take: 1, select: { s3Url: true } },
    },
  },
  datePlans: {
    orderBy: { scheduledAt: 'desc' as const },
    take: 12,
    select: {
      id: true,
      title: true,
      scheduledAt: true,
      budget: true,
      status: true,
      place: { select: { id: true, name: true, category: true, rating: true } },
    },
  },
  reviews: {
    orderBy: { createdAt: 'desc' as const },
    take: 10,
    select: {
      rating: true,
      place: { select: { name: true } },
    },
  },
} satisfies Prisma.CoupleSelect;

@Injectable()
export class CouplesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: {
    skip: number;
    take: number;
    status?: CoupleStatus;
    search?: string;
  }) {
    const where: Prisma.CoupleWhereInput = {};

    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { inviteCode: { contains: params.search, mode: 'insensitive' } },
        {
          members: {
            some: {
              user: {
                OR: [
                  { name: { contains: params.search, mode: 'insensitive' } },
                  { email: { contains: params.search, mode: 'insensitive' } },
                  { phone: { contains: params.search } },
                ],
              },
            },
          },
        },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.couple.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: coupleListSelect,
      }),
      this.prisma.couple.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.couple.findUnique({
      where: { id },
      select: coupleDetailSelect,
    });
  }

  updateStatus(id: string, status: CoupleStatus) {
    return this.prisma.couple.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        inviteCode: true,
        updatedAt: true,
      },
    });
  }

  delete(id: string) {
    return this.prisma.couple.delete({
      where: { id },
      select: { id: true, inviteCode: true, status: true },
    });
  }

  findAnalyticsSnapshot() {
    return this.prisma.couple.findMany({
      select: {
        id: true,
        status: true,
        inviteCode: true,
        anniversaryDate: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { datePlans: true, memories: true, messages: true } },
        datePlans: {
          select: {
            budget: true,
            createdAt: true,
            place: { select: { category: true, address: true } },
          },
        },
      },
    });
  }
}
