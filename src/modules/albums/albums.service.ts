import { Injectable } from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { AlbumsRepository } from './albums.repository';

@Injectable()
export class AlbumsService {
  constructor(private readonly albumsRepository: AlbumsRepository) {}

  findByCoupleId(coupleId: string) {
    return this.albumsRepository.findByCoupleId(coupleId);
  }

  create(dto: CreateAlbumDto) {
    return this.albumsRepository.create(dto);
  }
}
