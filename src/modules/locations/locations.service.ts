import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../common/exceptions';
import { MapboxService } from '../../shared/mapbox/mapbox.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationsRepository } from './locations.repository';

@Injectable()
export class LocationsService {
  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly mapboxService: MapboxService,
  ) {}

  findAll(limit?: number) {
    return this.locationsRepository.findAll(limit);
  }

  async findById(id: string) {
    const place = await this.locationsRepository.findById(id);
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  create(dto: CreateLocationDto) {
    return this.locationsRepository.create(dto);
  }

  mapboxConfig() {
    return this.mapboxService.getClientConfig();
  }
}
