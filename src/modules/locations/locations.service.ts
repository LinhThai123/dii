import { Injectable } from '@nestjs/common';
import { MapboxService } from '../../shared/mapbox/mapbox.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationsRepository } from './locations.repository';

@Injectable()
export class LocationsService {
  constructor(
    private readonly locationsRepository: LocationsRepository,
    private readonly mapboxService: MapboxService,
  ) {}

  findAll() {
    return this.locationsRepository.findAll();
  }

  findById(id: string) {
    return this.locationsRepository.findById(id);
  }

  create(dto: CreateLocationDto) {
    return this.locationsRepository.create(dto);
  }

  mapboxConfig() {
    return this.mapboxService.getClientConfig();
  }
}
