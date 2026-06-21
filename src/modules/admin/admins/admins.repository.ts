import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const adminSelect = {
  id: true,
  email: true,
  name: true,
  isActive: true,
  lastLoginAt: true,
  lastLoginIp: true,
  createdAt: true,
  updatedAt: true,
  roles: {
    select: {
      role: {
        select: { id: true, code: true, name: true, isSystem: true },
      },
    },
  },
} satisfies Prisma.AdminUserSelect;

@Injectable()
export class AdminsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip: number; take: number; isActive?: boolean }) {
    const where: Prisma.AdminUserWhereInput =
      params.isActive !== undefined ? { isActive: params.isActive } : {};

    return this.prisma.$transaction([
      this.prisma.adminUser.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: adminSelect,
      }),
      this.prisma.adminUser.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.adminUser.findUnique({
      where: { id },
      select: adminSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.adminUser.findUnique({ where: { email } });
  }

  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    isActive: boolean;
    roleIds: string[];
  }) {
    return this.prisma.adminUser.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        isActive: data.isActive,
        roles: {
          create: data.roleIds.map((roleId) => ({ roleId })),
        },
      },
      select: adminSelect,
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      isActive?: boolean;
      passwordHash?: string;
    },
  ) {
    return this.prisma.adminUser.update({
      where: { id },
      data,
      select: adminSelect,
    });
  }

  replaceRoles(adminId: string, roleIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.adminUserRole.deleteMany({ where: { adminId } });
      if (roleIds.length) {
        await tx.adminUserRole.createMany({
          data: roleIds.map((roleId) => ({ adminId, roleId })),
        });
      }
      return tx.adminUser.findUnique({
        where: { id: adminId },
        select: adminSelect,
      });
    });
  }

  delete(id: string) {
    return this.prisma.adminUser.delete({
      where: { id },
      select: { id: true, email: true },
    });
  }

  countSuperAdmins(excludeId?: string) {
    return this.prisma.adminUser.count({
      where: {
        isActive: true,
        id: excludeId ? { not: excludeId } : undefined,
        roles: { some: { role: { code: 'SUPER_ADMIN' } } },
      },
    });
  }

  hasSuperAdminRole(adminId: string) {
    return this.prisma.adminUserRole.findFirst({
      where: { adminId, role: { code: 'SUPER_ADMIN' } },
    });
  }

  hasSuperAdminInRoleIds(roleIds: string[]) {
    if (!roleIds.length) return Promise.resolve(null);
    return this.prisma.adminRole.findFirst({
      where: { id: { in: roleIds }, code: 'SUPER_ADMIN' },
    });
  }

  countRolesByIds(roleIds: string[]) {
    if (!roleIds.length) return Promise.resolve(0);
    return this.prisma.adminRole.count({ where: { id: { in: roleIds } } });
  }
}
