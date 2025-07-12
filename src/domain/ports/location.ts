export interface LocationData {
  latitude: number;
  longitude: number;
  placeName?: string;
  timestamp: number;
}

export interface LocationPort {
  getCurrentLocation(): Promise<LocationData | null>;
  getPlaceName(latitude: number, longitude: number): Promise<string | null>;
}
