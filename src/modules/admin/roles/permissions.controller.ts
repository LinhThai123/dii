import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RolesService } from './roles.service';

@ApiTags('admin-permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.read')
  findAll(
    @Query('module') module?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '100',
  ) {
    return this.rolesService.findAllPermissions(
      module,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 100,
    );
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findPermissionById(id);
  }
}
