import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/places.dto';

const regionSelect = {
  id: true,
  code: true,
  name: true,
  nameEn: true,
  type: true,
  slug: true,
} satisfies Prisma.ProvinceSelect;

const placeSelect = {
  id: true,
  googlePlaceId: true,
  name: true,
  address: true,
  provinceId: true,
  wardId: true,
  latitude: true,
  longitude: true,
  rating: true,
  reviewCount: true,
  category: true,
  priceLevel: true,
  openingHours: true,
  photos: true,
  phone: true,
  website: true,
  createdAt: true,
  updatedAt: true,
  province: { select: regionSelect },
  ward: { select: { ...regionSelect, provinceId: true } },
  _count: {
    select: { datePlans: true, favorites: true, reviews: true, memories: true },
  },
} satisfies Prisma.PlaceSelect;

@Injectable()
export class PlacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { skip: number; take: number; search?: string; category?: string }) {
    const where: Prisma.PlaceWhereInput = {};
    if (params.category) where.category = params.category;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { address: { contains: params.search, mode: 'insensitive' } },
        { province: { name: { contains: params.search, mode: 'insensitive' } } },
        { ward: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.place.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: placeSelect,
      }),
      this.prisma.place.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.place.findUnique({ where: { id }, select: placeSelect });
  }

  findProvinceById(id: string) {
    return this.prisma.province.findFirst({
      where: { id, isActive: true },
      select: { id: true },
    });
  }

  findWardById(id: string) {
    return this.prisma.ward.findFirst({
      where: { id, isActive: true },
      select: { id: true, provinceId: true },
    });
  }

  listProvinces() {
    return this.prisma.province.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        nameEn: true,
        type: true,
        slug: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  listWardsByProvince(provinceId: string) {
    return this.prisma.ward.findMany({
      where: { provinceId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        nameEn: true,
        type: true,
        slug: true,
        provinceId: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  create(data: CreatePlaceDto) {
    return this.prisma.place.create({
      data: {
        name: data.name,
        googlePlaceId: data.googlePlaceId,
        address: data.address,
        provinceId: data.provinceId,
        wardId: data.wardId,
        latitude: data.latitude,
        longitude: data.longitude,
        rating: data.rating,
        category: data.category,
        priceLevel: data.priceLevel,
        phone: data.phone,
        website: data.website,
        openingHours: data.openingHours as Prisma.InputJsonValue,
        photos: data.photos as Prisma.InputJsonValue,
      },
      select: placeSelect,
    });
  }

  update(id: string, data: UpdatePlaceDto) {
    const { provinceId, wardId, openingHours, photos, ...rest } = data;
    return this.prisma.place.update({
      where: { id },
      data: {
        ...rest,
        ...(provinceId !== undefined ? { provinceId } : {}),
        ...(wardId !== undefined ? { wardId } : {}),
        openingHours: openingHours as Prisma.InputJsonValue | undefined,
        photos: photos as Prisma.InputJsonValue | undefined,
      },
      select: placeSelect,
    });
  }

  delete(id: string) {
    return this.prisma.place.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }

  findByGooglePlaceId(googlePlaceId: string, excludeId?: string) {
    return this.prisma.place.findFirst({
      where: {
        googlePlaceId,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true, name: true, googlePlaceId: true },
    });
  }

  findFavorites(params: {
    skip: number;
    take: number;
    coupleId?: string;
    placeId?: string;
  }) {
    const where: Prisma.FavoriteWhereInput = {};
    if (params.coupleId) where.coupleId = params.coupleId;
    if (params.placeId) where.placeId = params.placeId;

    return this.prisma.$transaction([
      this.prisma.favorite.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          couple: { select: { id: true, inviteCode: true, status: true } },
          place: { select: { id: true, name: true, address: true, category: true } },
        },
      }),
      this.prisma.favorite.count({ where }),
    ]);
  }
}
