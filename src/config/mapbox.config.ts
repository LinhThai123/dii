/**
 * Mapbox client config — mirrors dii-app `src/constants/mapbox.ts`.
 * Public token (pk.*) powers map display + Search Box for admin places.
 */
export const mapboxConfig = {
  accessToken: process.env.MAPBOX_ACCESS_TOKEN?.trim() || '',
  styleUrl:
    process.env.MAPBOX_STYLE_URL?.trim() || 'mapbox://styles/mapbox/streets-v12',
  defaultZoom: Number(process.env.MAPBOX_DEFAULT_ZOOM) || 13.4,
  /** Hồ Gươm, Hà Nội — same default as dii-app */
  defaultCenter: {
    latitude: Number(process.env.MAPBOX_DEFAULT_LATITUDE) || 21.0285,
    longitude: Number(process.env.MAPBOX_DEFAULT_LONGITUDE) || 105.8542,
  },
  /** HCMC center — bias POI search toward major city */
  searchProximity: {
    longitude: Number(process.env.MAPBOX_SEARCH_LONGITUDE) || 106.7009,
    latitude: Number(process.env.MAPBOX_SEARCH_LATITUDE) || 10.7769,
  },
  suggestUrl: 'https://api.mapbox.com/search/searchbox/v1/suggest',
  retrieveUrl: (mapboxId: string) =>
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}`,
  get isConfigured() {
    return Boolean(this.accessToken);
  },
};

export type MapboxClientConfig = {
  configured: boolean;
  accessToken: string | null;
  styleUrl: string;
  defaultZoom: number;
  defaultCenter: {
    latitude: number;
    longitude: number;
  };
};

export type MapboxPlaceSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

export type MapboxPlaceDetails = {
  placeId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  types: string[];
};
