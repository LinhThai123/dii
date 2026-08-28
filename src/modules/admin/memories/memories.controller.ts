import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { MemoriesService } from './memories.service';

@ApiTags('admin-memories')
@ApiBearerAuth()
@Controller('memories')
@UseGuards(PermissionsGuard)
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Get()
  @RequirePermissions('memories.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('coupleId') coupleId?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.memoriesService.findAll(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      coupleId,
      search,
      dateFrom,
      dateTo,
    );
  }

  @Get(':id')
  @RequirePermissions('memories.read')
  findOne(@Param('id') id: string) {
    return this.memoriesService.findById(id);
  }

  @Delete(':id')
  @RequirePermissions('memories.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.memoriesService.remove(id, admin.id, ip);
  }
}
