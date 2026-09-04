import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(limit?: number) {
    const take =
      limit != null ? Math.min(Math.max(Math.trunc(limit), 1), 50) : undefined;

    return this.prisma.place.findMany({
      orderBy: [{ rating: { sort: 'desc', nulls: 'last' } }, { name: 'asc' }],
      ...(take != null ? { take } : {}),
    });
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
