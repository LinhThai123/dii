import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { AdminsService } from './admins.service';
import {
  AssignAdminRolesDto,
  CreateAdminDto,
  UpdateAdminDto,
} from './dto/admins.dto';

@ApiTags('admin-admins')
@ApiBearerAuth()
@Controller('admins')
@UseGuards(PermissionsGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @RequirePermissions('admins.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.adminsService.findAll(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      activeFilter,
    );
  }

  @Get(':id')
  @RequirePermissions('admins.read')
  findOne(@Param('id') id: string) {
    return this.adminsService.findById(id);
  }

  @Post()
  @RequirePermissions('admins.write')
  create(
    @Body() dto: CreateAdminDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.adminsService.create(dto, admin.id, ip);
  }

  @Patch(':id')
  @RequirePermissions('admins.write')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.adminsService.update(id, dto, admin.id, ip);
  }

  @Put(':id/roles')
  @RequirePermissions('admins.write')
  assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignAdminRolesDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.adminsService.assignRoles(id, dto, admin.id, ip);
  }

  @Delete(':id')
  @RequirePermissions('admins.write')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.adminsService.remove(id, admin.id, ip);
  }
}
