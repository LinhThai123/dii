import { Injectable } from '@nestjs/common';
import { CoupleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const coupleAnniversarySelect = {
  id: true,
  inviteCode: true,
  anniversaryDate: true,
  createdAt: true,
  status: true,
  members: {
    select: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
} satisfies Prisma.CoupleSelect;

@Injectable()
export class AnniversariesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCouples(params: { search?: string }) {
    const where: Prisma.CoupleWhereInput = {
      status: { in: [CoupleStatus.ACTIVE, CoupleStatus.PENDING] },
    };

    if (params.search) {
      where.OR = [
        { inviteCode: { contains: params.search, mode: 'insensitive' } },
        {
          members: {
            some: {
              user: {
                OR: [
                  { name: { contains: params.search, mode: 'insensitive' } },
                  { email: { contains: params.search, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ];
    }

    return this.prisma.couple.findMany({
      where,
      select: coupleAnniversarySelect,
      orderBy: { anniversaryDate: 'asc' },
    });
  }
}
