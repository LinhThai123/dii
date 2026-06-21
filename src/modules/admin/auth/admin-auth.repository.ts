import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AdminAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.adminUser.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  }

  updateLastLogin(id: string, ip?: string) {
    return this.prisma.adminUser.update({
      where: { id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });
  }

  saveRefreshToken(adminId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.adminRefreshToken.create({
      data: { adminId, tokenHash, expiresAt },
    });
  }

  findRefreshToken(tokenHash: string) {
    return this.prisma.adminRefreshToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
  }

  deleteRefreshToken(id: string) {
    return this.prisma.adminRefreshToken.delete({ where: { id } });
  }

  deleteAdminRefreshTokens(adminId: string) {
    return this.prisma.adminRefreshToken.deleteMany({ where: { adminId } });
  }
}
