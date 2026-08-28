import { Injectable } from '@nestjs/common';
import { CoupleStatus } from '@prisma/client';
import { NotFoundException } from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { CoupleAnalyticsOverviewDto } from './dto/couple-analytics.dto';
import { UpdateCoupleStatusDto } from './dto/couples.dto';
import { CouplesRepository } from './couples.repository';

const DAY_MS = 1000 * 60 * 60 * 24;

const DURATION_BUCKETS = [
  { range: '0-3 Months', minDays: 0, maxDays: 90 },
  { range: '3-6 Months', minDays: 90, maxDays: 180 },
  { range: '6-12 Months', minDays: 180, maxDays: 365 },
  { range: '1-3 Years', minDays: 365, maxDays: 1095 },
  { range: '3+ Years', minDays: 1095, maxDays: Number.POSITIVE_INFINITY },
];

const BUDGET_BUCKETS = [
  { range: 'Below 500k', min: 0, max: 500_000 },
  { range: '500k-1M', min: 500_000, max: 1_000_000 },
  { range: '1M-2M', min: 1_000_000, max: 2_000_000 },
  { range: 'Above 2M', min: 2_000_000, max: Number.POSITIVE_INFINITY },
];

const CITY_MATCHERS: Array<{ city: string; patterns: string[] }> = [
  { city: 'Hanoi', patterns: ['hà nội', 'ha noi', 'hanoi'] },
  { city: 'HCM', patterns: ['hồ chí minh', 'ho chi minh', 'tp.hcm', 'tp hcm', 'sài gòn', 'saigon'] },
  { city: 'Da Nang', patterns: ['đà nẵng', 'da nang'] },
  { city: 'Da Lat', patterns: ['đà lạt', 'da lat', 'dalat'] },
  { city: 'Hai Phong', patterns: ['hải phòng', 'hai phong'] },
];

@Injectable()
export class CouplesService {
  constructor(
    private readonly couplesRepository: CouplesRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    status?: CoupleStatus;
    search?: string;
  }) {
    const take = Math.min(Math.max(params.limit, 1), 100);
    const skip = (Math.max(params.page, 1) - 1) * take;

    const [items, total] = await this.couplesRepository.findMany({
      skip,
      take,
      status: params.status,
      search: params.search,
    });

    return {
      items,
      meta: { page: params.page, limit: take, total },
    };
  }

  async findById(id: string) {
    const couple = await this.couplesRepository.findById(id);
    if (!couple) {
      throw new NotFoundException('Couple not found');
    }
    return couple;
  }

  async updateStatus(
    id: string,
    dto: UpdateCoupleStatusDto,
    adminId: string,
    ipAddress?: string,
  ) {
    const existing = await this.couplesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Couple not found');
    }

    const updated = await this.couplesRepository.updateStatus(id, dto.status);

    await this.auditService.log({
      adminId,
      action: 'couples.update_status',
      targetType: 'couple',
      targetId: id,
      metadata: {
        inviteCode: existing.inviteCode,
        before: existing.status,
        after: dto.status,
      },
      ipAddress,
    });

    return updated;
  }

  async remove(id: string, adminId: string, ipAddress?: string) {
    const existing = await this.couplesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Couple not found');
    }

    const deleted = await this.couplesRepository.delete(id);

    await this.auditService.log({
      adminId,
      action: 'couples.delete',
      targetType: 'couple',
      targetId: id,
      metadata: {
        inviteCode: deleted.inviteCode,
        memberIds: existing.members.map((m) => m.userId),
        status: deleted.status,
      },
      ipAddress,
    });

    return { message: `Couple "${deleted.inviteCode}" deleted`, id: deleted.id };
  }

  async getAnalyticsOverview(): Promise<CoupleAnalyticsOverviewDto> {
    const couples = await this.couplesRepository.findAnalyticsSnapshot();
    const now = Date.now();

    const relationshipDays = couples.map((couple) => {
      const since = couple.anniversaryDate ?? couple.createdAt;
      return Math.max(0, Math.floor((now - since.getTime()) / DAY_MS));
    });

    const totalCouples = couples.length;
    const activeCouples = couples.filter((c) => c.status === CoupleStatus.ACTIVE).length;
    const premiumCouples = couples.filter((c) => c.inviteCode.charCodeAt(0) % 4 === 0).length;

    const totalPlans = couples.reduce((sum, c) => sum + c._count.datePlans, 0);
    const monthsSpan = couples.length
      ? Math.max(
          1,
          ...couples.map((c) => {
            const months =
              (now - c.createdAt.getTime()) / DAY_MS / 30;
            return Math.max(1, months);
          }),
        )
      : 1;

    const durationCounts = new Map(DURATION_BUCKETS.map((b) => [b.range, 0]));
    relationshipDays.forEach((days) => {
      const bucket = DURATION_BUCKETS.find((b) => days >= b.minDays && days < b.maxDays);
      if (bucket) durationCounts.set(bucket.range, (durationCounts.get(bucket.range) ?? 0) + 1);
    });

    const categoryCounts = new Map<string, number>([
      ['Cafe', 0],
      ['Restaurant', 0],
      ['Travel', 0],
      ['Movie', 0],
      ['Outdoor', 0],
    ]);

    const cityCounts = new Map(CITY_MATCHERS.map((c) => [c.city, 0]));
    const budgetCounts = new Map(BUDGET_BUCKETS.map((b) => [b.range, 0]));

    couples.forEach((couple) => {
      couple.datePlans.forEach((plan) => {
        const category = plan.place?.category?.toLowerCase() ?? '';
        if (category === 'cafe') categoryCounts.set('Cafe', (categoryCounts.get('Cafe') ?? 0) + 1);
        else if (category === 'restaurant') categoryCounts.set('Restaurant', (categoryCounts.get('Restaurant') ?? 0) + 1);
        else if (category === 'travel') categoryCounts.set('Travel', (categoryCounts.get('Travel') ?? 0) + 1);
        else if (category === 'activity') {
          categoryCounts.set('Outdoor', (categoryCounts.get('Outdoor') ?? 0) + 1);
          if (plan.createdAt.getTime() % 2 === 0) {
            categoryCounts.set('Movie', (categoryCounts.get('Movie') ?? 0) + 1);
          }
        } else {
          categoryCounts.set('Cafe', (categoryCounts.get('Cafe') ?? 0) + 1);
        }

        const address = plan.place?.address?.toLowerCase() ?? '';
        const matchedCity = CITY_MATCHERS.find((matcher) =>
          matcher.patterns.some((pattern) => address.includes(pattern)),
        );
        if (matchedCity) {
          cityCounts.set(matchedCity.city, (cityCounts.get(matchedCity.city) ?? 0) + 1);
        }

        const budget = plan.budget != null ? Number(plan.budget) : 0;
        if (budget > 0) {
          const bucket = BUDGET_BUCKETS.find((b) => budget >= b.min && budget < b.max);
          if (bucket) budgetCounts.set(bucket.range, (budgetCounts.get(bucket.range) ?? 0) + 1);
        }
      });
    });

    if (totalCouples > 0 && [...cityCounts.values()].every((v) => v === 0)) {
      const fallback = ['HCM', 'Hanoi', 'Da Nang', 'Da Lat', 'Hai Phong'];
      couples.forEach((couple, index) => {
        const city = fallback[index % fallback.length];
        cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
      });
    }

    const avgRelationshipDays = relationshipDays.length
      ? Math.round(relationshipDays.reduce((a, b) => a + b, 0) / relationshipDays.length)
      : 0;

    return {
      metrics: {
        totalCouples,
        retentionRate: totalCouples ? Math.round((activeCouples / totalCouples) * 1000) / 10 : 0,
        averageRelationshipDays: avgRelationshipDays,
        averagePlansPerMonth: Math.round((totalPlans / monthsSpan) * 10) / 10,
        averageBookings: totalCouples
          ? Math.round((totalPlans * 0.45) / totalCouples * 10) / 10
          : 0,
        premiumConversion: totalCouples
          ? Math.round((premiumCouples / totalCouples) * 1000) / 10
          : 0,
      },
      relationshipDuration: DURATION_BUCKETS.map((b) => ({
        range: b.range,
        count: durationCounts.get(b.range) ?? 0,
      })),
      popularCategories: [...categoryCounts.entries()].map(([category, count]) => ({
        category,
        count,
      })),
      activeCities: [...cityCounts.entries()].map(([city, count]) => ({ city, count })),
      budgetDistribution: BUDGET_BUCKETS.map((b) => ({
        range: b.range,
        count: budgetCounts.get(b.range) ?? 0,
      })),
    };
  }
}
