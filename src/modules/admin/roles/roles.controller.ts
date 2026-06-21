import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';
import { RolesService } from './roles.service';

@ApiTags('admin-roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.read')
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.rolesService.findAll(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
    );
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @RequirePermissions('roles.write')
  create(
    @Body() dto: CreateRoleDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.rolesService.create(dto, admin.id, ip);
  }

  @Patch(':id')
  @RequirePermissions('roles.write')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.rolesService.update(id, dto, admin.id, ip);
  }

  @Delete(':id')
  @RequirePermissions('roles.write')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.rolesService.remove(id, admin.id, ip);
  }
}
