import { Injectable } from '@nestjs/common';
import { DatePlanStatus } from '@prisma/client';
import { NotFoundException } from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { DatesRepository } from './dates.repository';

@Injectable()
export class DatesService {
  constructor(
    private readonly datesRepository: DatesRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(
    page: number,
    limit: number,
    status?: DatePlanStatus,
    coupleId?: string,
    search?: string,
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.datesRepository.findMany({
      skip,
      take,
      status,
      coupleId,
      search,
    });
    return { items, meta: { page, limit: take, total } };
  }

  async findById(id: string) {
    const plan = await this.datesRepository.findById(id);
    if (!plan) throw new NotFoundException('Date plan not found');
    return plan;
  }

  async remove(id: string, adminId: string, ipAddress?: string) {
    await this.findById(id);
    const deleted = await this.datesRepository.delete(id);
    await this.auditService.log({
      adminId,
      action: 'dates.delete',
      targetType: 'date_plan',
      targetId: id,
      metadata: { title: deleted.title, coupleId: deleted.coupleId },
      ipAddress,
    });
    return { message: `Date plan "${deleted.title}" deleted`, id: deleted.id };
  }
}
