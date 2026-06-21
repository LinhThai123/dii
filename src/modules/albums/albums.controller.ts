import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';

@ApiTags('albums')
@ApiBearerAuth()
@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  findAll(@Query('coupleId') coupleId: string) {
    return this.albumsService.findByCoupleId(coupleId);
  }

  @Post()
  create(@Body() dto: CreateAlbumDto) {
    return this.albumsService.create(dto);
  }
}
