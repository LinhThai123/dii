import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.place.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string) {
    return this.prisma.place.findUnique({ where: { id } });
  }

  create(data: CreateLocationDto) {
    return this.prisma.place.create({
      data: {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        googlePlaceId: data.placeId,
      },
    });
  }
}
