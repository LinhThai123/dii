import { Injectable } from '@nestjs/common';
import { DatePlanStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const datePlanSelect = {
  id: true,
  coupleId: true,
  createdById: true,
  title: true,
  description: true,
  scheduledAt: true,
  durationMinutes: true,
  placeId: true,
  budget: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  couple: { select: { id: true, inviteCode: true, status: true } },
  createdBy: { select: { id: true, name: true, email: true, phone: true } },
  place: { select: { id: true, name: true, address: true } },
  _count: { select: { checklistItems: true, memories: true } },
} satisfies Prisma.DatePlanSelect;

@Injectable()
export class DatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: {
    skip: number;
    take: number;
    status?: DatePlanStatus;
    coupleId?: string;
    search?: string;
  }) {
    const where: Prisma.DatePlanWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.coupleId) where.coupleId = params.coupleId;
    if (params.search) {
      where.OR = [{ title: { contains: params.search, mode: 'insensitive' } }];
    }

    return this.prisma.$transaction([
      this.prisma.datePlan.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { scheduledAt: 'desc' },
        select: datePlanSelect,
      }),
      this.prisma.datePlan.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.datePlan.findUnique({
      where: { id },
      select: {
        ...datePlanSelect,
        checklistItems: {
          select: {
            id: true,
            title: true,
            isCompleted: true,
            assignedTo: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  delete(id: string) {
    return this.prisma.datePlan.delete({
      where: { id },
      select: { id: true, title: true, coupleId: true },
    });
  }
}
