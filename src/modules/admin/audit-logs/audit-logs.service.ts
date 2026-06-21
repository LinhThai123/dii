import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions';
import { AuditLogsRepository } from './audit-logs.repository';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async findAll(params: {
    page: number;
    limit: number;
    adminId?: string;
    action?: string;
    targetType?: string;
    from?: string;
    to?: string;
  }) {
    const take = Math.min(Math.max(params.limit, 1), 100);
    const skip = (Math.max(params.page, 1) - 1) * take;

    const [items, total] = await this.auditLogsRepository.findMany({
      skip,
      take,
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? new Date(params.to) : undefined,
    });

    return {
      items,
      meta: { page: params.page, limit: take, total },
    };
  }

  async findById(id: string) {
    const log = await this.auditLogsRepository.findById(id);
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return log;
  }
}
