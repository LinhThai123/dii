import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(
    page: number,
    limit: number,
    placeId?: string,
    userId?: string,
    minRating?: number,
    search?: string,
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.reviewsRepository.findMany({
      skip,
      take,
      placeId,
      userId,
      minRating,
      search,
    });
    return { items, meta: { page, limit: take, total } };
  }

  async findById(id: string) {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async remove(id: string, adminId: string, ipAddress?: string) {
    await this.findById(id);
    const deleted = await this.reviewsRepository.delete(id);
    await this.auditService.log({
      adminId,
      action: 'reviews.delete',
      targetType: 'review',
      targetId: id,
      metadata: {
        placeId: deleted.placeId,
        userId: deleted.userId,
        rating: deleted.rating,
      },
      ipAddress,
    });
    return { message: 'Review deleted', id: deleted.id };
  }
}
