import { Injectable } from '@nestjs/common';
import { AuthProvider, OtpPurpose, Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAuthAccount(provider: AuthProvider, providerAccountId: string) {
    return this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      include: { user: true },
    });
  }

  findUserAuthAccounts(userId: string) {
    return this.prisma.authAccount.findMany({ where: { userId } });
  }

  createUserWithAuthAccount(data: {
    phone?: string;
    email?: string;
    name?: string;
    avatar?: string;
    provider: AuthProvider;
    providerAccountId: string;
    isVerified?: boolean;
    metadata?: Prisma.InputJsonValue;
    accessToken?: string;
    refreshToken?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: data.phone,
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          status: UserStatus.ACTIVE,
        },
      });

      await tx.authAccount.create({
        data: {
          userId: user.id,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          isVerified: data.isVerified ?? false,
          metadata: data.metadata,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          lastUsedAt: new Date(),
        },
      });

      return user;
    });
  }

  linkAuthAccount(
    userId: string,
    data: {
      provider: AuthProvider;
      providerAccountId: string;
      isVerified?: boolean;
      metadata?: Prisma.InputJsonValue;
      accessToken?: string;
      refreshToken?: string;
    },
  ) {
    return this.prisma.authAccount.create({
      data: {
        userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        isVerified: data.isVerified ?? true,
        metadata: data.metadata,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        lastUsedAt: new Date(),
      },
    });
  }

  updateAuthAccountTokens(
    id: string,
    data: {
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: Date;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.authAccount.update({
      where: { id },
      data: { ...data, lastUsedAt: new Date() },
    });
  }

  saveOtp(phone: string, codeHash: string, purpose: OtpPurpose, expiresAt: Date) {
    return this.prisma.otpCode.create({
      data: { phone, codeHash, purpose, expiresAt },
    });
  }

  findLatestOtp(phone: string, purpose: OtpPurpose) {
    return this.prisma.otpCode.findFirst({
      where: { phone, purpose, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  incrementOtpAttempts(id: string) {
    return this.prisma.otpCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  deleteOtp(id: string) {
    return this.prisma.otpCode.delete({ where: { id } });
  }

  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  findRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  }

  deleteRefreshToken(id: string) {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  deleteUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
