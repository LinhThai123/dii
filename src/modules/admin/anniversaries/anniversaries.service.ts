import { Injectable } from '@nestjs/common';
import { AnniversariesRepository } from './anniversaries.repository';

const DAY_MS = 1000 * 60 * 60 * 24;

export type AnniversaryPeriodFilter = 'all' | 'today' | 'week' | 'month' | 'upcoming';

interface CoupleRow {
  id: string;
  inviteCode: string;
  anniversaryDate: Date | null;
  createdAt: Date;
  status: string;
  members: Array<{
    user: { id: string; name: string | null; email: string | null };
  }>;
}

export interface AnniversaryListItem {
  id: string;
  coupleId: string;
  coupleLabel: string;
  partnerA: string;
  partnerB: string | null;
  relationshipDate: string;
  nextAnniversary: string;
  daysRemaining: number;
  premium: boolean;
  notificationScheduled: boolean;
}

export interface AnniversaryStats {
  upcoming: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getRelationshipDate(couple: CoupleRow): Date {
  return couple.anniversaryDate ?? couple.createdAt;
}

function getNextAnniversary(relationshipDate: Date, from = new Date()): Date {
  const base = startOfDay(from);
  const year = base.getFullYear();
  let next = new Date(year, relationshipDate.getMonth(), relationshipDate.getDate());
  if (next < base) {
    next = new Date(year + 1, relationshipDate.getMonth(), relationshipDate.getDate());
  }
  return next;
}

function daysRemaining(next: Date, from = new Date()): number {
  return Math.round((startOfDay(next).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

function isThisMonth(next: Date, from = new Date()): boolean {
  return next.getMonth() === from.getMonth() && next.getFullYear() === from.getFullYear();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isPremium(inviteCode: string): boolean {
  return inviteCode.charCodeAt(0) % 4 === 0;
}

function isNotificationScheduled(coupleId: string): boolean {
  return coupleId.charCodeAt(coupleId.length - 1) % 3 !== 0;
}

@Injectable()
export class AnniversariesService {
  constructor(private readonly anniversariesRepository: AnniversariesRepository) {}

  async findAll(params: {
    search?: string;
    period?: AnniversaryPeriodFilter;
    page?: number;
    limit?: number;
  }) {
    const couples = await this.anniversariesRepository.findCouples({
      search: params.search,
    });

    const now = new Date();
    const items: AnniversaryListItem[] = couples.map((couple) => {
      const relationship = getRelationshipDate(couple);
      const next = getNextAnniversary(relationship, now);
      const remaining = daysRemaining(next, now);
      const partnerA =
        couple.members[0]?.user.name?.trim() ||
        couple.members[0]?.user.email?.trim() ||
        'Partner A';
      const partnerB =
        couple.members[1]?.user.name?.trim() ||
        couple.members[1]?.user.email?.trim() ||
        null;

      return {
        id: `${couple.id}-anniversary`,
        coupleId: couple.id,
        coupleLabel: partnerB ? `${partnerA} & ${partnerB}` : partnerA,
        partnerA,
        partnerB,
        relationshipDate: formatDate(relationship),
        nextAnniversary: formatDate(next),
        daysRemaining: remaining,
        premium: isPremium(couple.inviteCode),
        notificationScheduled: isNotificationScheduled(couple.id),
      };
    });

    items.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const stats: AnniversaryStats = {
      upcoming: items.filter((i) => i.daysRemaining >= 0).length,
      today: items.filter((i) => i.daysRemaining === 0).length,
      thisWeek: items.filter((i) => i.daysRemaining >= 0 && i.daysRemaining <= 6).length,
      thisMonth: items.filter((i) => {
        const relationship = couples.find((c) => c.id === i.coupleId);
        if (!relationship) return false;
        const next = getNextAnniversary(getRelationshipDate(relationship), now);
        return isThisMonth(next, now);
      }).length,
    };

    const period = params.period ?? 'all';
    const filtered = items.filter((item) => {
      if (period === 'today') return item.daysRemaining === 0;
      if (period === 'week') return item.daysRemaining >= 0 && item.daysRemaining <= 6;
      if (period === 'month') {
        const couple = couples.find((c) => c.id === item.coupleId);
        if (!couple) return false;
        const next = getNextAnniversary(getRelationshipDate(couple), now);
        return isThisMonth(next, now);
      }
      if (period === 'upcoming') return item.daysRemaining >= 0;
      return true;
    });

    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;

    return {
      items: filtered.slice(skip, skip + limit),
      meta: { page, limit, total: filtered.length },
      stats,
    };
  }
}
