import { Injectable } from '@nestjs/common';
import { CoupleStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCoupleDto } from './dto/create-couple.dto';

@Injectable()
export class CouplesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.couple.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
  }

  findByInviteCode(inviteCode: string) {
    return this.prisma.couple.findUnique({
      where: { inviteCode },
      include: { members: true },
    });
  }

  create(data: CreateCoupleDto, inviteCode: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const couple = await tx.couple.create({
        data: {
          inviteCode,
          status: CoupleStatus.PENDING,
          members: {
            create: { userId },
          },
        },
        include: { members: true },
      });
      return couple;
    });
  }

  linkPartner(coupleId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.coupleMember.create({
        data: { coupleId, userId },
      });
      return tx.couple.update({
        where: { id: coupleId },
        data: { status: CoupleStatus.ACTIVE },
        include: { members: { include: { user: true } } },
      });
    });
  }
}
