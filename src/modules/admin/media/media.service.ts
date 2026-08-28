import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { MediaRepository } from './media.repository';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAlbums(page: number, limit: number, coupleId?: string, search?: string) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.mediaRepository.findAlbums({
      skip,
      take,
      coupleId,
      search,
    });
    return { items, meta: { page, limit: take, total } };
  }

  async findAlbumById(id: string) {
    const album = await this.mediaRepository.findAlbumById(id);
    if (!album) throw new NotFoundException('Album not found');
    return album;
  }

  async removeAlbum(id: string, adminId: string, ipAddress?: string) {
    await this.findAlbumById(id);
    const deleted = await this.mediaRepository.deleteAlbum(id);
    await this.auditService.log({
      adminId,
      action: 'media.delete_album',
      targetType: 'album',
      targetId: id,
      metadata: { title: deleted.title, coupleId: deleted.coupleId },
      ipAddress,
    });
    return { message: `Album "${deleted.title}" deleted`, id: deleted.id };
  }

  async findPhotos(
    page: number,
    limit: number,
    albumId?: string,
    memoryId?: string,
    coupleId?: string,
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.mediaRepository.findPhotos({
      skip,
      take,
      albumId,
      memoryId,
      coupleId,
    });
    return { items, meta: { page, limit: take, total } };
  }

  async findPhotoById(id: string) {
    const photo = await this.mediaRepository.findPhotoById(id);
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }

  async removePhoto(id: string, adminId: string, ipAddress?: string) {
    await this.findPhotoById(id);
    const deleted = await this.mediaRepository.deletePhoto(id);
    await this.auditService.log({
      adminId,
      action: 'media.delete_photo',
      targetType: 'photo',
      targetId: id,
      metadata: { s3Url: deleted.s3Url },
      ipAddress,
    });
    return { message: 'Photo deleted', id: deleted.id };
  }
}
