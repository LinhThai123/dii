import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(params: {
    adminId: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
  }) {
    return this.prisma.adminAuditLog.create({ data: params });
  }
}
