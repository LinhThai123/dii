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
import { CreatePlaceDto, UpdatePlaceDto } from './dto/places.dto';
import { PlacesService } from './places.service';

@ApiTags('admin-places')
@ApiBearerAuth()
@Controller('places')
@UseGuards(PermissionsGuard)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('mapbox/config')
  @RequirePermissions('places.read')
  mapboxConfig() {
    return this.placesService.mapboxConfigured();
  }

  @Get('mapbox/search')
  @RequirePermissions('places.read')
  searchMapbox(@Query('q') query = '') {
    return this.placesService.searchMapboxPlaces(query);
  }

  @Get('mapbox/details')
  @RequirePermissions('places.read')
  mapboxDetails(
    @Query('placeId') placeId: string,
    @Query('sessionToken') sessionToken?: string,
  ) {
    return this.placesService.getMapboxPlaceDetails(placeId, sessionToken);
  }

  @Get('mapbox/geocode')
  @RequirePermissions('places.read')
  geocodeMapbox(
    @Query('q') query = '',
    @Query('lng') lng?: string,
    @Query('lat') lat?: string,
  ) {
    const longitude = lng != null && lng !== '' ? Number(lng) : undefined;
    const latitude = lat != null && lat !== '' ? Number(lat) : undefined;
    const proximity =
      longitude != null &&
      latitude != null &&
      Number.isFinite(longitude) &&
      Number.isFinite(latitude)
        ? { longitude, latitude }
        : undefined;
    return this.placesService.geocodeMapbox(query, proximity);
  }

  @Get('mapbox/check')
  @RequirePermissions('places.read')
  checkMapboxPlaceId(
    @Query('placeId') placeId: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.placesService.checkMapboxPlaceId(placeId, excludeId);
  }

  @Get('regions/provinces')
  @RequirePermissions('places.read')
  listProvinces() {
    return this.placesService.listProvinces();
  }

  @Get('regions/wards')
  @RequirePermissions('places.read')
  listWards(@Query('provinceId') provinceId: string) {
    return this.placesService.listWards(provinceId);
  }

  @Get()
  @RequirePermissions('places.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.placesService.findAll(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      search,
      category,
    );
  }

  @Get(':id')
  @RequirePermissions('places.read')
  findOne(@Param('id') id: string) {
    return this.placesService.findById(id);
  }

  @Post()
  @RequirePermissions('places.write')
  create(
    @Body() dto: CreatePlaceDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.placesService.create(dto, admin.id, ip);
  }

  @Patch(':id')
  @RequirePermissions('places.write')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaceDto,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.placesService.update(id, dto, admin.id, ip);
  }

  @Delete(':id')
  @RequirePermissions('places.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() admin: AdminAuthenticatedUser,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress;
    return this.placesService.remove(id, admin.id, ip);
  }
}

@ApiTags('admin-favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(PermissionsGuard)
export class FavoritesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  @RequirePermissions('places.read')
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('coupleId') coupleId?: string,
    @Query('placeId') placeId?: string,
  ) {
    return this.placesService.findFavorites(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      coupleId,
      placeId,
    );
  }
}
