import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { AdminsRepository } from './admins.repository';
import {
  AssignAdminRolesDto,
  CreateAdminDto,
  UpdateAdminDto,
} from './dto/admins.dto';

@Injectable()
export class AdminsService {
  constructor(
    private readonly adminsRepository: AdminsRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(page: number, limit: number, isActive?: boolean) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.adminsRepository.findMany({
      skip,
      take,
      isActive,
    });

    return {
      items: items.map((admin) => this.formatAdmin(admin)),
      meta: { page, limit: take, total },
    };
  }

  async findById(id: string) {
    const admin = await this.adminsRepository.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return this.formatAdmin(admin);
  }

  async create(dto: CreateAdminDto, actorId: string, ipAddress?: string) {
    const existing = await this.adminsRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    await this.validateRoleIds(dto.roleIds);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const admin = await this.adminsRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      isActive: dto.isActive ?? true,
      roleIds: dto.roleIds,
    });

    await this.auditService.log({
      adminId: actorId,
      action: 'admins.create',
      targetType: 'admin_user',
      targetId: admin!.id,
      metadata: { email: admin!.email, roleIds: dto.roleIds },
      ipAddress,
    });

    return this.formatAdmin(admin!);
  }

  async update(
    id: string,
    dto: UpdateAdminDto,
    actorId: string,
    ipAddress?: string,
  ) {
    const existing = await this.adminsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Admin not found');
    }

    if (id === actorId && dto.isActive === false) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    if (dto.isActive === false) {
      await this.ensureNotLastSuperAdmin(id);
    }

    const data: { name?: string; isActive?: boolean; passwordHash?: string } =
      {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const admin = await this.adminsRepository.update(id, data);

    await this.auditService.log({
      adminId: actorId,
      action: 'admins.update',
      targetType: 'admin_user',
      targetId: id,
      metadata: {
        before: { name: existing.name, isActive: existing.isActive },
        after: { name: admin!.name, isActive: admin!.isActive },
        passwordChanged: !!dto.password,
      },
      ipAddress,
    });

    return this.formatAdmin(admin!);
  }

  async assignRoles(
    id: string,
    dto: AssignAdminRolesDto,
    actorId: string,
    ipAddress?: string,
  ) {
    const existing = await this.adminsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Admin not found');
    }

    await this.validateRoleIds(dto.roleIds);

    const hadSuperAdmin = existing.roles.some(
      (r) => r.role.code === 'SUPER_ADMIN',
    );
    const willHaveSuperAdmin = await this.rolesIncludeSuperAdmin(dto.roleIds);

    if (hadSuperAdmin && !willHaveSuperAdmin) {
      await this.ensureNotLastSuperAdmin(id);
    }

    const admin = await this.adminsRepository.replaceRoles(id, dto.roleIds);

    await this.auditService.log({
      adminId: actorId,
      action: 'admins.assign_roles',
      targetType: 'admin_user',
      targetId: id,
      metadata: { roleIds: dto.roleIds },
      ipAddress,
    });

    return this.formatAdmin(admin!);
  }

  async remove(id: string, actorId: string, ipAddress?: string) {
    if (id === actorId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    const existing = await this.adminsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Admin not found');
    }

    await this.ensureNotLastSuperAdmin(id);

    const deleted = await this.adminsRepository.delete(id);

    await this.auditService.log({
      adminId: actorId,
      action: 'admins.delete',
      targetType: 'admin_user',
      targetId: id,
      metadata: { email: deleted.email },
      ipAddress,
    });

    return { message: `Admin "${deleted.email}" deleted` };
  }

  private async validateRoleIds(roleIds: string[]) {
    const count = await this.adminsRepository.countRolesByIds(roleIds);
    if (count !== roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }
  }

  private async ensureNotLastSuperAdmin(adminId: string) {
    const isSuperAdmin = await this.adminsRepository.hasSuperAdminRole(adminId);
    if (!isSuperAdmin) return;

    const others = await this.adminsRepository.countSuperAdmins(adminId);
    if (others === 0) {
      throw new BadRequestException(
        'Cannot remove or deactivate the last active Super Admin',
      );
    }
  }

  private async rolesIncludeSuperAdmin(roleIds: string[]) {
    const role = await this.adminsRepository.hasSuperAdminInRoleIds(roleIds);
    return !!role;
  }

  private formatAdmin(
    admin: NonNullable<Awaited<ReturnType<AdminsRepository['findById']>>>,
  ) {
    return {
      ...admin,
      roles: admin.roles.map((r) => r.role),
    };
  }
}
