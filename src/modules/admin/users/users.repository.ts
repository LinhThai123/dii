import { Injectable } from '@nestjs/common';
import { AuthProvider, Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const userListSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  status: true,
  createdAt: true,
  authAccounts: {
    select: { id: true, provider: true, isVerified: true, lastUsedAt: true },
  },
  _count: {
    select: { coupleMembers: true, memories: true, messages: true },
  },
} satisfies Prisma.UserSelect;

const userDetailSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  avatar: true,
  bio: true,
  dateOfBirth: true,
  gender: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  authAccounts: {
    select: {
      id: true,
      provider: true,
      providerAccountId: true,
      isVerified: true,
      lastUsedAt: true,
      createdAt: true,
    },
  },
  preferences: true,
  coupleMembers: {
    select: {
      joinedAt: true,
      couple: {
        select: {
          id: true,
          inviteCode: true,
          status: true,
          anniversaryDate: true,
          relationshipStatus: true,
          createdAt: true,
          members: {
            select: {
              userId: true,
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
        },
      },
    },
  },
  _count: {
    select: {
      memories: true,
      messages: true,
      photos: true,
      reviews: true,
      notifications: true,
    },
  },
} satisfies Prisma.UserSelect;

const authAccountSelect = {
  id: true,
  provider: true,
  providerAccountId: true,
  isVerified: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AuthAccountSelect;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: {
    skip: number;
    take: number;
    status?: UserStatus;
    provider?: AuthProvider;
    search?: string;
  }) {
    const where: Prisma.UserWhereInput = {};

    if (params.status) where.status = params.status;
    if (params.provider) {
      where.authAccounts = { some: { provider: params.provider } };
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: userListSelect,
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: userDetailSelect,
    });
  }

  updateStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  findPreferences(userId: string) {
    return this.prisma.userPreference.findUnique({ where: { userId } });
  }

  findAuthAccounts(userId: string) {
    return this.prisma.authAccount.findMany({
      where: { userId },
      select: authAccountSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  findAuthAccount(userId: string, accountId: string) {
    return this.prisma.authAccount.findFirst({
      where: { id: accountId, userId },
      select: authAccountSelect,
    });
  }

  countAuthAccounts(userId: string) {
    return this.prisma.authAccount.count({ where: { userId } });
  }

  deleteAuthAccount(accountId: string) {
    return this.prisma.authAccount.delete({
      where: { id: accountId },
      select: { id: true, provider: true, userId: true },
    });
  }

  revokeRefreshTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
