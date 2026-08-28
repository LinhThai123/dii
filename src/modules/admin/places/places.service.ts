import { Injectable } from '@nestjs/common';
import { BadRequestException, ConflictException, NotFoundException } from '../../../common/exceptions';
import { MapboxService } from '../../../shared/mapbox/mapbox.service';
import { AdminAuditService } from '../shared/admin-audit.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/places.dto';
import { PlacesRepository } from './places.repository';

@Injectable()
export class PlacesService {
  constructor(
    private readonly placesRepository: PlacesRepository,
    private readonly auditService: AdminAuditService,
    private readonly mapboxService: MapboxService,
  ) {}

  async findAll(page: number, limit: number, search?: string, category?: string) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.placesRepository.findMany({
      skip,
      take,
      search,
      category,
    });
    return { items, meta: { page, limit: take, total } };
  }

  async findById(id: string) {
    const place = await this.placesRepository.findById(id);
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  async create(dto: CreatePlaceDto, adminId: string, ipAddress?: string) {
    try {
      if (dto.googlePlaceId) {
        dto.googlePlaceId = this.mapboxService.normalizePlaceId(dto.googlePlaceId);
        if (!this.mapboxService.isValidPlaceId(dto.googlePlaceId)) {
          throw new BadRequestException('Mapbox Place ID không hợp lệ');
        }
      }
      await this.assertRegionRefs(dto.provinceId, dto.wardId);
      const place = await this.placesRepository.create(dto);
      await this.auditService.log({
        adminId,
        action: 'places.create',
        targetType: 'place',
        targetId: place.id,
        metadata: { name: place.name },
        ipAddress,
      });
      return place;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        throw new ConflictException('Mapbox Place ID already exists');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdatePlaceDto, adminId: string, ipAddress?: string) {
    await this.findById(id);
    if (dto.googlePlaceId) {
      dto.googlePlaceId = this.mapboxService.normalizePlaceId(dto.googlePlaceId);
      if (!this.mapboxService.isValidPlaceId(dto.googlePlaceId)) {
        throw new BadRequestException('Mapbox Place ID không hợp lệ');
      }
    }
    await this.assertRegionRefs(
      dto.provinceId === null ? undefined : dto.provinceId ?? undefined,
      dto.wardId === null ? undefined : dto.wardId ?? undefined,
    );
    // When clearing province, also clear ward if client sends null province
    if (dto.provinceId === null && dto.wardId === undefined) {
      dto.wardId = null;
    }
    const place = await this.placesRepository.update(id, dto);
    await this.auditService.log({
      adminId,
      action: 'places.update',
      targetType: 'place',
      targetId: id,
      metadata: { name: place.name },
      ipAddress,
    });
    return place;
  }

  async remove(id: string, adminId: string, ipAddress?: string) {
    await this.findById(id);
    const deleted = await this.placesRepository.delete(id);
    await this.auditService.log({
      adminId,
      action: 'places.delete',
      targetType: 'place',
      targetId: id,
      metadata: { name: deleted.name },
      ipAddress,
    });
    return { message: `Place "${deleted.name}" deleted`, id: deleted.id };
  }

  async findFavorites(
    page: number,
    limit: number,
    coupleId?: string,
    placeId?: string,
  ) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.placesRepository.findFavorites({
      skip,
      take,
      coupleId,
      placeId,
    });
    return { items, meta: { page, limit: take, total } };
  }

  mapboxConfigured() {
    return this.mapboxService.getClientConfig();
  }

  searchMapboxPlaces(query: string) {
    return this.mapboxService.search(query);
  }

  getMapboxPlaceDetails(placeId: string, sessionToken?: string) {
    return this.mapboxService.getDetails(placeId, sessionToken);
  }

  geocodeMapbox(
    query: string,
    proximity?: { longitude: number; latitude: number },
  ) {
    return this.mapboxService.geocode(query, { proximity });
  }

  async checkMapboxPlaceId(placeId: string, excludeId?: string) {
    const normalized = this.mapboxService.normalizePlaceId(placeId);
    if (!normalized) {
      return { valid: true, available: true, normalized: null };
    }

    const valid = this.mapboxService.isValidPlaceId(normalized);
    if (!valid) {
      return { valid: false, available: false, normalized };
    }

    const existing = await this.placesRepository.findByGooglePlaceId(normalized, excludeId);
    return {
      valid: true,
      available: !existing,
      normalized,
      existingPlace: existing,
    };
  }

  listProvinces() {
    return this.placesRepository.listProvinces();
  }

  async listWards(provinceId: string) {
    if (!provinceId?.trim()) {
      throw new BadRequestException('provinceId is required');
    }
    const province = await this.placesRepository.findProvinceById(provinceId);
    if (!province) throw new NotFoundException('Province not found');
    return this.placesRepository.listWardsByProvince(provinceId);
  }

  private async assertRegionRefs(provinceId?: string, wardId?: string) {
    if (wardId && !provinceId) {
      throw new BadRequestException('Cần chọn tỉnh/thành trước khi chọn phường/xã');
    }

    if (provinceId) {
      const province = await this.placesRepository.findProvinceById(provinceId);
      if (!province) throw new BadRequestException('Tỉnh/thành không hợp lệ');
    }

    if (wardId) {
      const ward = await this.placesRepository.findWardById(wardId);
      if (!ward) throw new BadRequestException('Phường/xã không hợp lệ');
      if (provinceId && ward.provinceId !== provinceId) {
        throw new BadRequestException('Phường/xã không thuộc tỉnh/thành đã chọn');
      }
    }
  }
}
