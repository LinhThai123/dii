import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('admin-audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(PermissionsGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermissions('audit.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditLogsService.findAll({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      adminId,
      action,
      targetType,
      from,
      to,
    });
  }

  @Get(':id')
  @RequirePermissions('audit.read')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findById(id);
  }
}
