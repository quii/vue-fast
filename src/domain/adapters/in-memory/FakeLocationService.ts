import type { LocationPort, LocationData } from '../../ports/location.js';

export class FakeLocationService implements LocationPort {
  private shouldFail: boolean = false;
  private mockLocation: LocationData | null = null;
  private mockPlaceName: string | null = null;

  async getCurrentLocation(): Promise<LocationData | null> {
    if (this.shouldFail) {
      return null;
    }

    return this.mockLocation || {
      latitude: 51.5074,
      longitude: -0.1278,
      placeName: 'Test Location',
      timestamp: Date.now()
    };
  }

  async getPlaceName(latitude: number, longitude: number): Promise<string | null> {
    if (this.shouldFail) {
      return null;
    }

    return this.mockPlaceName || 'Test Place Name';
  }

  // Test helper methods
  setMockLocation(location: LocationData | null): void {
    this.mockLocation = location;
  }

  setMockPlaceName(placeName: string | null): void {
    this.mockPlaceName = placeName;
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }
}
