import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const roleSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  permissions: {
    select: {
      permission: {
        select: { id: true, code: true, module: true, description: true },
      },
    },
  },
  _count: { select: { users: true } },
} satisfies Prisma.AdminRoleSelect;

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip: number; take: number }) {
    return this.prisma.$transaction([
      this.prisma.adminRole.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { code: 'asc' },
        select: roleSelect,
      }),
      this.prisma.adminRole.count(),
    ]);
  }

  findById(id: string) {
    return this.prisma.adminRole.findUnique({
      where: { id },
      select: roleSelect,
    });
  }

  findByCode(code: string) {
    return this.prisma.adminRole.findUnique({ where: { code } });
  }

  create(data: {
    code: string;
    name: string;
    description?: string;
    permissionIds: string[];
  }) {
    return this.prisma.adminRole.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        isSystem: false,
        permissions: {
          create: data.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      select: roleSelect,
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      permissionIds?: string[];
    },
  ) {
    if (data.permissionIds !== undefined) {
      return this.prisma.$transaction(async (tx) => {
        await tx.adminRolePermission.deleteMany({ where: { roleId: id } });
        if (data.permissionIds!.length) {
          await tx.adminRolePermission.createMany({
            data: data.permissionIds!.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
        return tx.adminRole.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
          },
          select: roleSelect,
        });
      });
    }

    return this.prisma.adminRole.update({
      where: { id },
      data: { name: data.name, description: data.description },
      select: roleSelect,
    });
  }

  delete(id: string) {
    return this.prisma.adminRole.delete({
      where: { id },
      select: { id: true, code: true },
    });
  }

  findPermissions(params: { module?: string; skip: number; take: number }) {
    const where: Prisma.PermissionWhereInput = params.module
      ? { module: params.module }
      : {};

    return this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ module: 'asc' }, { code: 'asc' }],
      }),
      this.prisma.permission.count({ where }),
    ]);
  }

  findPermissionById(id: string) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  validatePermissionIds(ids: string[]) {
    if (!ids.length) return Promise.resolve(0);
    return this.prisma.permission.count({
      where: { id: { in: ids } },
    });
  }

  hasWildcardInPermissionIds(permissionIds: string[]) {
    if (!permissionIds.length) return Promise.resolve(null);
    return this.prisma.permission.findFirst({
      where: { id: { in: permissionIds }, code: '*' },
    });
  }
}
