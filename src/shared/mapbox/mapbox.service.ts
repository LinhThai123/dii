import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '../../common/exceptions';
import {
  mapboxConfig,
  type MapboxClientConfig,
  type MapboxPlaceDetails,
  type MapboxPlaceSuggestion,
} from '../../config/mapbox.config';

interface MapboxSuggestItem {
  name?: string;
  mapbox_id?: string;
  feature_type?: string;
  address?: string;
  full_address?: string;
  place_formatted?: string;
  maki?: string;
  poi_category_ids?: string[];
  poi_category?: string[];
}

interface MapboxRetrieveFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    mapbox_id?: string;
    feature_type?: string;
    address?: string;
    full_address?: string;
    place_formatted?: string;
    maki?: string;
    poi_category_ids?: string[];
    poi_category?: string[];
    coordinates?: { latitude?: number; longitude?: number };
  };
}

@Injectable()
export class MapboxService {
  private readonly logger = new Logger(MapboxService.name);

  isConfigured() {
    return mapboxConfig.isConfigured;
  }

  getClientConfig(): MapboxClientConfig {
    const configured = mapboxConfig.isConfigured;
    return {
      configured,
      accessToken: configured ? mapboxConfig.accessToken : null,
      styleUrl: mapboxConfig.styleUrl,
      defaultZoom: mapboxConfig.defaultZoom,
      defaultCenter: { ...mapboxConfig.defaultCenter },
    };
  }

  async search(
    query: string,
    options?: { proximity?: { longitude: number; latitude: number } },
  ): Promise<{ configured: boolean; sessionToken: string | null; items: MapboxPlaceSuggestion[] }> {
    const q = query.trim();
    if (q.length < 2) {
      return { configured: mapboxConfig.isConfigured, sessionToken: null, items: [] };
    }

    if (!mapboxConfig.isConfigured) {
      return { configured: false, sessionToken: null, items: [] };
    }

    const sessionToken = randomUUID();
    const url = new URL(mapboxConfig.suggestUrl);
    url.searchParams.set('q', q);
    url.searchParams.set('access_token', mapboxConfig.accessToken);
    url.searchParams.set('session_token', sessionToken);
    url.searchParams.set('country', 'vn');
    url.searchParams.set('language', 'vi');
    url.searchParams.set('limit', '8');
    const proximity = options?.proximity ?? mapboxConfig.searchProximity;
    url.searchParams.set('proximity', `${proximity.longitude},${proximity.latitude}`);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const body = await response.text();
      this.logger.warn(`Mapbox suggest failed (${response.status}): ${body}`);
      throw new BadRequestException('Không thể tìm kiếm Mapbox. Kiểm tra token và quota.');
    }

    const data = (await response.json()) as { suggestions?: MapboxSuggestItem[] };
    const items = (data.suggestions ?? [])
      .filter((s) => Boolean(s.mapbox_id) && s.feature_type !== 'brand')
      .map((s) => ({
        placeId: s.mapbox_id!,
        label: s.full_address ?? s.name ?? s.mapbox_id!,
        mainText: s.name ?? s.mapbox_id!,
        secondaryText: s.place_formatted ?? s.full_address ?? s.address ?? '',
      }));

    return { configured: true, sessionToken, items };
  }

  /** Resolve best match for a free-text address (suggest → retrieve). */
  async geocode(
    query: string,
    options?: { proximity?: { longitude: number; latitude: number } },
  ): Promise<MapboxPlaceDetails | null> {
    const result = await this.search(query, options);
    if (!result.configured || result.items.length === 0) return null;
    return this.getDetails(result.items[0].placeId, result.sessionToken ?? undefined);
  }

  async getDetails(placeId: string, sessionToken?: string): Promise<MapboxPlaceDetails> {
    const normalized = this.normalizePlaceId(placeId);
    if (!this.isValidPlaceId(normalized)) {
      throw new BadRequestException('Mapbox Place ID không hợp lệ');
    }

    if (!mapboxConfig.isConfigured) {
      throw new BadRequestException('Mapbox chưa được cấu hình trên server');
    }

    const token = sessionToken?.trim() || randomUUID();
    const url = new URL(mapboxConfig.retrieveUrl(normalized));
    url.searchParams.set('access_token', mapboxConfig.accessToken);
    url.searchParams.set('session_token', token);
    url.searchParams.set('language', 'vi');

    const response = await fetch(url.toString());
    if (!response.ok) {
      const body = await response.text();
      this.logger.warn(`Mapbox retrieve failed (${response.status}): ${body}`);
      throw new BadRequestException('Không thể lấy chi tiết địa điểm từ Mapbox');
    }

    const data = (await response.json()) as { features?: MapboxRetrieveFeature[] };
    const feature = data.features?.[0];
    const props = feature?.properties;
    if (!props?.mapbox_id && !normalized) {
      throw new BadRequestException('Không tìm thấy địa điểm trên Mapbox');
    }

    const longitude =
      props?.coordinates?.longitude ?? feature?.geometry?.coordinates?.[0];
    const latitude =
      props?.coordinates?.latitude ?? feature?.geometry?.coordinates?.[1];

    const categoryIds = props?.poi_category_ids ?? [];
    const categoryLabels = props?.poi_category ?? [];
    const types = [
      props?.feature_type,
      props?.maki,
      ...categoryIds,
      ...categoryLabels,
    ].filter((t): t is string => Boolean(t));

    return {
      placeId: props?.mapbox_id ?? normalized,
      name: props?.name ?? '',
      address: props?.full_address ?? props?.address ?? props?.place_formatted,
      latitude,
      longitude,
      category: this.mapCategory(types),
      types,
    };
  }

  normalizePlaceId(value: string): string {
    return value.trim();
  }

  /**
   * Search Box `mapbox_id` (base64-like) or legacy Geocoding ids (`poi.123`) / Google ids.
   */
  isValidPlaceId(value: string): boolean {
    const id = this.normalizePlaceId(value);
    if (!id || id.length < 8 || id.length > 2048) return false;
    if (/^[a-z][a-z0-9]*\.[A-Za-z0-9_-]+$/i.test(id)) return true;
    if (/^[A-Za-z0-9_=-]+$/.test(id)) return true;
    return false;
  }

  private mapCategory(types: string[]): string {
    const haystack = types.map((t) => t.toLowerCase().trim()).filter(Boolean);

    if (haystack.some((t) => t.includes('cafe') || t.includes('coffee') || t.includes('tea'))) {
      return 'cafe';
    }
    if (
      haystack.some(
        (t) =>
          t.includes('restaurant') ||
          t.includes('food') ||
          t.includes('bakery') ||
          t.includes('fast_food'),
      )
    ) {
      return 'restaurant';
    }
    if (
      haystack.some(
        (t) =>
          t.includes('tourist') ||
          t.includes('park') ||
          t.includes('museum') ||
          t.includes('attraction') ||
          t.includes('monument') ||
          t.includes('hotel'),
      )
    ) {
      return 'travel';
    }
    return 'activity';
  }
}
