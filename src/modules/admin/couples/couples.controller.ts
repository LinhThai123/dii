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
import { CoupleStatus } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { CouplesService } from './couples.service';
import { UpdateCoupleStatusDto } from './dto/couples.dto';

@ApiTags('admin-couples')
@ApiBearerAuth()
@Controller('couples')
@UseGuards(PermissionsGuard)
export class CouplesController {
  constructor(private readonly couplesService: CouplesService) {}

  @Get()
  @RequirePermissions('couples.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: CoupleStatus,
    @Query('search') search?: string,
  ) {
    return this.couplesService.findAll({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      status,
      search,
    });
  }

  @Get('analytics/overview')
  @RequirePermissions('couples.read')
  analyticsOverview() {
    return this.couplesService.getAnalyticsOverview();
  }

  @Get(':id')
  @RequirePermissions('couples.read')
  findOne(@Param('id') id: string) {
    return this.couplesService.findById(id);
  }

  @Patch(':id/status')
  @RequirePermissions('couples.write')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCoupleStatusDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.couplesService.updateStatus(id, dto, admin.id, ip);
  }

  @Delete(':id')
  @RequirePermissions('couples.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.couplesService.remove(id, admin.id, ip);
  }
}
