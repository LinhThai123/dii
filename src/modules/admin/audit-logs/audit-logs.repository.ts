import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const auditLogSelect = {
  id: true,
  adminId: true,
  action: true,
  targetType: true,
  targetId: true,
  metadata: true,
  ipAddress: true,
  createdAt: true,
  admin: { select: { id: true, email: true, name: true } },
} satisfies Prisma.AdminAuditLogSelect;

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: {
    skip: number;
    take: number;
    adminId?: string;
    action?: string;
    targetType?: string;
    from?: Date;
    to?: Date;
  }) {
    const where: Prisma.AdminAuditLogWhereInput = {};

    if (params.adminId) where.adminId = params.adminId;
    if (params.action) where.action = { contains: params.action };
    if (params.targetType) where.targetType = params.targetType;
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = params.from;
      if (params.to) where.createdAt.lte = params.to;
    }

    return this.prisma.$transaction([
      this.prisma.adminAuditLog.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: auditLogSelect,
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.adminAuditLog.findUnique({
      where: { id },
      select: auditLogSelect,
    });
  }
}
