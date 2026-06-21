import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(page: number, limit: number) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.rolesRepository.findMany({ skip, take });

    return {
      items: items.map((role) => this.formatRole(role)),
      meta: { page, limit: take, total },
    };
  }

  async findById(id: string) {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.formatRole(role);
  }

  async create(dto: CreateRoleDto, adminId: string, ipAddress?: string) {
    const existing = await this.rolesRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Role code "${dto.code}" already exists`);
    }

    await this.validatePermissionIds(dto.permissionIds);

    const role = await this.rolesRepository.create(dto);

    await this.auditService.log({
      adminId,
      action: 'roles.create',
      targetType: 'admin_role',
      targetId: role!.id,
      metadata: { code: role!.code, permissionIds: dto.permissionIds },
      ipAddress,
    });

    return this.formatRole(role!);
  }

  async update(
    id: string,
    dto: UpdateRoleDto,
    adminId: string,
    ipAddress?: string,
  ) {
    const existing = await this.rolesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (dto.permissionIds !== undefined) {
      await this.validatePermissionIds(dto.permissionIds);

      if (existing.code === 'SUPER_ADMIN') {
        const hasWildcard =
          await this.rolesRepository.hasWildcardInPermissionIds(
            dto.permissionIds,
          );
        if (!hasWildcard) {
          throw new ForbiddenException(
            'SUPER_ADMIN role must retain the "*" permission',
          );
        }
      }
    }

    const role = await this.rolesRepository.update(id, dto);

    await this.auditService.log({
      adminId,
      action: 'roles.update',
      targetType: 'admin_role',
      targetId: id,
      metadata: {
        code: existing.code,
        permissionIds: dto.permissionIds,
      },
      ipAddress,
    });

    return this.formatRole(role!);
  }

  async remove(id: string, adminId: string, ipAddress?: string) {
    const existing = await this.rolesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (existing.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    if (existing._count.users > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to admins',
      );
    }

    const deleted = await this.rolesRepository.delete(id);

    await this.auditService.log({
      adminId,
      action: 'roles.delete',
      targetType: 'admin_role',
      targetId: id,
      metadata: { code: deleted.code },
      ipAddress,
    });

    return { message: `Role "${deleted.code}" deleted` };
  }

  async findAllPermissions(module: string | undefined, page: number, limit: number) {
    const take = Math.min(Math.max(limit, 1), 200);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.rolesRepository.findPermissions({
      module,
      skip,
      take,
    });

    const grouped = items.reduce<Record<string, typeof items>>((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
    }, {});

    return {
      items,
      grouped,
      meta: { page, limit: take, total },
    };
  }

  async findPermissionById(id: string) {
    const permission = await this.rolesRepository.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  private async validatePermissionIds(permissionIds: string[]) {
    const count = await this.rolesRepository.validatePermissionIds(permissionIds);
    if (count !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }
  }

  private formatRole(
    role: NonNullable<Awaited<ReturnType<RolesRepository['findById']>>>,
  ) {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      adminCount: role._count.users,
      permissions: role.permissions.map((p) => p.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
