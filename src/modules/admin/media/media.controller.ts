import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import type { AdminAuthenticatedUser } from '../../../shared/interfaces/admin-jwt-payload.interface';
import { MediaService } from './media.service';

@ApiTags('admin-albums')
@ApiBearerAuth()
@Controller('albums')
@UseGuards(PermissionsGuard)
export class AlbumsController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @RequirePermissions('media.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('coupleId') coupleId?: string,
    @Query('search') search?: string,
  ) {
    return this.mediaService.findAlbums(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      coupleId,
      search,
    );
  }

  @Get(':id')
  @RequirePermissions('media.read')
  findOne(@Param('id') id: string) {
    return this.mediaService.findAlbumById(id);
  }

  @Delete(':id')
  @RequirePermissions('media.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.mediaService.removeAlbum(id, admin.id, ip);
  }
}

@ApiTags('admin-photos')
@ApiBearerAuth()
@Controller('photos')
@UseGuards(PermissionsGuard)
export class PhotosController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @RequirePermissions('media.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('albumId') albumId?: string,
    @Query('memoryId') memoryId?: string,
    @Query('coupleId') coupleId?: string,
  ) {
    return this.mediaService.findPhotos(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      albumId,
      memoryId,
      coupleId,
    );
  }

  @Get(':id')
  @RequirePermissions('media.read')
  findOne(@Param('id') id: string) {
    return this.mediaService.findPhotoById(id);
  }

  @Delete(':id')
  @RequirePermissions('media.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.mediaService.removePhoto(id, admin.id, ip);
  }
}
