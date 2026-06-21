import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';

@Injectable()
export class AlbumsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCoupleId(coupleId: string) {
    return this.prisma.album.findMany({
      where: { coupleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateAlbumDto) {
    return this.prisma.album.create({ data });
  }
}
