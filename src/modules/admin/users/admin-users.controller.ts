import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { PrismaService } from '../../../database/prisma/prisma.service';

@ApiTags('admin-users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(PermissionsGuard)
export class AdminUsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions('users.read')
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    const take = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    return this.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        status: true,
        createdAt: true,
        authAccounts: { select: { provider: true, isVerified: true } },
      },
    });
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id') id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        bio: true,
        status: true,
        createdAt: true,
        authAccounts: { select: { provider: true, isVerified: true, createdAt: true } },
        coupleMembers: {
          select: { couple: { select: { id: true, status: true, inviteCode: true } } },
        },
      },
    });
  }

  @Patch(':id/status')
  @RequirePermissions('users.suspend')
  updateStatus(@Param('id') id: string, @Query('status') status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }
}
