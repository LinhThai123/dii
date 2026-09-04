import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('limit') limit?: string) {
    const parsed = limit != null && limit !== '' ? Number(limit) : undefined;
    return this.locationsService.findAll(
      Number.isFinite(parsed) ? parsed : undefined,
    );
  }

  /** Mapbox client config for dii-app Discover map (pk.* token + defaults) */
  @Public()
  @Get('mapbox/config')
  mapboxConfig() {
    return this.locationsService.mapboxConfig();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }
}
