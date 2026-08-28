import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthProvider, UserStatus } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { UpdateUserStatusDto } from './dto/users.dto';
import { UsersService } from './users.service';

@ApiTags('admin-users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: UserStatus,
    @Query('provider') provider?: AuthProvider,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      status,
      provider,
      search,
    });
  }

  @Get(':id/preferences')
  @RequirePermissions('users.read')
  findPreferences(@Param('id') id: string) {
    return this.usersService.findPreferences(id);
  }

  @Get(':id/auth-accounts')
  @RequirePermissions('users.read')
  findAuthAccounts(@Param('id') id: string) {
    return this.usersService.findAuthAccounts(id);
  }

  @Delete(':id/auth-accounts/:accountId')
  @RequirePermissions('users.suspend')
  unlinkAuthAccount(
    @Param('id') id: string,
    @Param('accountId') accountId: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.usersService.unlinkAuthAccount(id, accountId, admin.id, ip);
  }

  @Patch(':id/status')
  @RequirePermissions('users.suspend')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.usersService.updateStatus(id, dto, admin.id, ip);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
