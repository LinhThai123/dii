import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { MemoriesRepository } from './memories.repository';

@Injectable()
export class MemoriesService {
  constructor(
    private readonly memoriesRepository: MemoriesRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(
    page: number,
    limit: number,
    coupleId?: string,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.memoriesRepository.findMany({
      skip,
      take,
      coupleId,
      search,
      dateFrom,
      dateTo,
    });
    return { items, meta: { page, limit: take, total } };
  }

  async findById(id: string) {
    const memory = await this.memoriesRepository.findById(id);
    if (!memory) throw new NotFoundException('Memory not found');
    return memory;
  }

  async remove(id: string, adminId: string, ipAddress?: string) {
    await this.findById(id);
    const deleted = await this.memoriesRepository.delete(id);
    await this.auditService.log({
      adminId,
      action: 'memories.delete',
      targetType: 'memory',
      targetId: id,
      metadata: { title: deleted.title, coupleId: deleted.coupleId },
      ipAddress,
    });
    return { message: `Memory "${deleted.title}" deleted`, id: deleted.id };
  }
}
