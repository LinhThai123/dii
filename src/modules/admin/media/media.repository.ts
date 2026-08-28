import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAlbums(params: { skip: number; take: number; coupleId?: string; search?: string }) {
    const where: Prisma.AlbumWhereInput = {};
    if (params.coupleId) where.coupleId = params.coupleId;
    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }

    return this.prisma.$transaction([
      this.prisma.album.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          coupleId: true,
          title: true,
          coverUrl: true,
          createdAt: true,
          updatedAt: true,
          couple: { select: { id: true, inviteCode: true } },
          _count: { select: { photos: true } },
        },
      }),
      this.prisma.album.count({ where }),
    ]);
  }

  findAlbumById(id: string) {
    return this.prisma.album.findUnique({
      where: { id },
      select: {
        id: true,
        coupleId: true,
        title: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
        couple: { select: { id: true, inviteCode: true } },
        photos: {
          select: {
            id: true,
            s3Url: true,
            caption: true,
            createdAt: true,
            uploadedBy: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  deleteAlbum(id: string) {
    return this.prisma.album.delete({
      where: { id },
      select: { id: true, title: true, coupleId: true },
    });
  }

  findPhotos(params: {
    skip: number;
    take: number;
    albumId?: string;
    memoryId?: string;
    coupleId?: string;
  }) {
    const where: Prisma.PhotoWhereInput = {};
    if (params.albumId) where.albumId = params.albumId;
    if (params.memoryId) where.memoryId = params.memoryId;
    if (params.coupleId) {
      where.OR = [
        { album: { coupleId: params.coupleId } },
        { memory: { coupleId: params.coupleId } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.photo.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          memoryId: true,
          albumId: true,
          s3Url: true,
          caption: true,
          createdAt: true,
          uploadedBy: { select: { id: true, name: true } },
          album: { select: { id: true, title: true, coupleId: true } },
          memory: { select: { id: true, title: true, coupleId: true } },
        },
      }),
      this.prisma.photo.count({ where }),
    ]);
  }

  findPhotoById(id: string) {
    return this.prisma.photo.findUnique({
      where: { id },
      select: {
        id: true,
        memoryId: true,
        albumId: true,
        s3Url: true,
        caption: true,
        createdAt: true,
        uploadedBy: { select: { id: true, name: true, email: true } },
        album: { select: { id: true, title: true, coupleId: true } },
        memory: { select: { id: true, title: true, coupleId: true } },
      },
    });
  }

  deletePhoto(id: string) {
    return this.prisma.photo.delete({
      where: { id },
      select: { id: true, s3Url: true, albumId: true, memoryId: true },
    });
  }
}
