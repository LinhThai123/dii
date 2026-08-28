import { Injectable } from '@nestjs/common';
import { AuthProvider, UserStatus } from '@prisma/client';
import {
  BadRequestException,
  NotFoundException,
} from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { UpdateUserStatusDto } from './dto/users.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(params: {
    page: number;
    limit: number;
    status?: UserStatus;
    provider?: AuthProvider;
    search?: string;
  }) {
    const take = Math.min(Math.max(params.limit, 1), 100);
    const skip = (Math.max(params.page, 1) - 1) * take;

    const [items, total] = await this.usersRepository.findMany({
      skip,
      take,
      status: params.status,
      provider: params.provider,
      search: params.search,
    });

    return {
      items,
      meta: { page: params.page, limit: take, total },
    };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findPreferences(userId: string) {
    await this.ensureUserExists(userId);
    const preferences = await this.usersRepository.findPreferences(userId);
    return preferences ?? { userId, message: 'No preferences set' };
  }

  async findAuthAccounts(userId: string) {
    await this.ensureUserExists(userId);
    return this.usersRepository.findAuthAccounts(userId);
  }

  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    adminId: string,
    ipAddress?: string,
  ) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.usersRepository.updateStatus(id, dto.status);

    if (dto.status === UserStatus.SUSPENDED) {
      await this.usersRepository.revokeRefreshTokens(id);
    }

    await this.auditService.log({
      adminId,
      action: 'users.update_status',
      targetType: 'user',
      targetId: id,
      metadata: {
        before: existing.status,
        after: dto.status,
        sessionsRevoked: dto.status === UserStatus.SUSPENDED,
      },
      ipAddress,
    });

    return updated;
  }

  async unlinkAuthAccount(
    userId: string,
    accountId: string,
    adminId: string,
    ipAddress?: string,
  ) {
    await this.ensureUserExists(userId);

    const account = await this.usersRepository.findAuthAccount(userId, accountId);
    if (!account) {
      throw new NotFoundException('Auth account not found');
    }

    const accountCount = await this.usersRepository.countAuthAccounts(userId);
    if (accountCount <= 1) {
      throw new BadRequestException(
        'Cannot unlink the only auth account for this user',
      );
    }

    const deleted = await this.usersRepository.deleteAuthAccount(accountId);

    await this.auditService.log({
      adminId,
      action: 'users.unlink_auth_account',
      targetType: 'auth_account',
      targetId: accountId,
      metadata: {
        userId,
        provider: deleted.provider,
      },
      ipAddress,
    });

    return { message: `Auth account "${deleted.provider}" unlinked`, userId };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
