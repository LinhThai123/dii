import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const reviewSelect = {
  id: true,
  placeId: true,
  userId: true,
  coupleId: true,
  rating: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  place: { select: { id: true, name: true, address: true } },
  user: { select: { id: true, name: true, email: true, phone: true } },
  couple: { select: { id: true, inviteCode: true } },
} satisfies Prisma.ReviewSelect;

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: {
    skip: number;
    take: number;
    placeId?: string;
    userId?: string;
    minRating?: number;
    search?: string;
  }) {
    const where: Prisma.ReviewWhereInput = {};
    if (params.placeId) where.placeId = params.placeId;
    if (params.userId) where.userId = params.userId;
    if (params.minRating) where.rating = { gte: params.minRating };
    if (params.search) {
      where.text = { contains: params.search, mode: 'insensitive' };
    }

    return this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: reviewSelect,
      }),
      this.prisma.review.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.review.findUnique({ where: { id }, select: reviewSelect });
  }

  delete(id: string) {
    return this.prisma.review.delete({
      where: { id },
      select: { id: true, placeId: true, userId: true, rating: true },
    });
  }
}
