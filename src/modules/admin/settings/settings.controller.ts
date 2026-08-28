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
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';
import { BulkSettingsDto } from './dto/bulk-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('admin-settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions('settings.read')
  findAll(
    @Query('category') category?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.settingsService.findAll(
      category,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 50,
    );
  }

  @Get('bundle/platform')
  @RequirePermissions('settings.read')
  getPlatformBundle() {
    return this.settingsService.getPlatformBundle();
  }

  @Put('bundle/platform')
  @RequirePermissions('settings.write')
  savePlatformBundle(
    @Body() dto: BulkSettingsDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.settingsService.savePlatformBundle(dto, admin.id, ip);
  }

  @Get(':key')
  @RequirePermissions('settings.read')
  findOne(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Post()
  @RequirePermissions('settings.write')
  create(
    @Body() dto: CreateSettingDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.settingsService.create(dto, admin.id, ip);
  }

  @Patch(':key')
  @RequirePermissions('settings.write')
  update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.settingsService.update(key, dto, admin.id, ip);
  }

  @Delete(':key')
  @RequirePermissions('settings.write')
  remove(
    @Param('key') key: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.settingsService.remove(key, admin.id, ip);
  }
}
