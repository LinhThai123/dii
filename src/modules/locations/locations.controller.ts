import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll() {
    return this.locationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }
}
