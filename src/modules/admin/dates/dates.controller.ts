import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DatePlanStatus } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { DatesService } from './dates.service';

@ApiTags('admin-dates')
@ApiBearerAuth()
@Controller('dates')
@UseGuards(PermissionsGuard)
export class DatesController {
  constructor(private readonly datesService: DatesService) {}

  @Get()
  @RequirePermissions('dates.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: DatePlanStatus,
    @Query('coupleId') coupleId?: string,
    @Query('search') search?: string,
  ) {
    return this.datesService.findAll(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      status,
      coupleId,
      search,
    );
  }

  @Get(':id')
  @RequirePermissions('dates.read')
  findOne(@Param('id') id: string) {
    return this.datesService.findById(id);
  }

  @Delete(':id')
  @RequirePermissions('dates.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.datesService.remove(id, admin.id, ip);
  }
}
