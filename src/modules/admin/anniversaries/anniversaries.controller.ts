import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { AnniversariesService } from './anniversaries.service';
import type { AnniversaryPeriodFilter } from './anniversaries.service';

@ApiTags('admin-anniversaries')
@ApiBearerAuth()
@Controller('anniversaries')
@UseGuards(PermissionsGuard)
export class AnniversariesController {
  constructor(private readonly anniversariesService: AnniversariesService) {}

  @Get()
  @RequirePermissions('couples.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('period') period?: AnniversaryPeriodFilter,
  ) {
    return this.anniversariesService.findAll({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      search,
      period,
    });
  }
}
