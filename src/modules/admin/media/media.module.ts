import { Module } from '@nestjs/common';
import { AlbumsController, PhotosController } from './media.controller';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';

@Module({
  controllers: [AlbumsController, PhotosController],
  providers: [MediaService, MediaRepository],
})
export class MediaModule {}
