import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateDatePlanDto } from './dto/create-date-plan.dto';

@Injectable()
export class DatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCoupleId(coupleId: string) {
    return this.prisma.datePlan.findMany({
      where: { coupleId },
      include: { place: true, checklistItems: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.datePlan.findUnique({
      where: { id },
      include: { place: true, checklistItems: true },
    });
  }

  create(data: CreateDatePlanDto & { createdById: string }) {
    return this.prisma.datePlan.create({
      data: {
        coupleId: data.coupleId,
        createdById: data.createdById,
        title: data.title,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt),
        placeId: data.placeId,
        budget: data.budget,
        notes: data.notes,
      },
      include: { place: true, checklistItems: true },
    });
  }
}
