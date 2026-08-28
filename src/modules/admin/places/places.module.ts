import { Module } from '@nestjs/common';
import { FavoritesController, PlacesController } from './places.controller';
import { PlacesRepository } from './places.repository';
import { PlacesService } from './places.service';

@Module({
  controllers: [PlacesController, FavoritesController],
  providers: [PlacesService, PlacesRepository],
})
export class PlacesModule {}
