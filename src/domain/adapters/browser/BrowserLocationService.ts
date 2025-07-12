import type { LocationPort, LocationData } from '../../ports/location.js';

export class BrowserLocationService implements LocationPort {
  private readonly timeoutMs = 10000; // 10 second timeout
  private readonly maxAgeMs = 300000; // 5 minutes cache

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        return null;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: this.timeoutMs,
            maximumAge: this.maxAgeMs
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Try to get place name, but don't fail if it's not available
      const placeName = await this.getPlaceName(latitude, longitude);

      return {
        latitude,
        longitude,
        placeName: placeName || undefined,
        timestamp: Date.now()
      };
    } catch (error) {
      // Silently fail as per requirements - location is not key functionality
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.debug('Failed to get current location:', errorMessage);
      return null;
    }
  }

  async getPlaceName(latitude: number, longitude: number): Promise<string | null> {
    try {
      // Use OpenStreetMap Nominatim API for reverse geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ArcheryScoreApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.display_name) {
        // Try to extract a meaningful location name
        const address = data.address;
        if (address) {
          // Prefer building/facility name, then road, then suburb/city
          const locationParts = [
            address.building,
            address.leisure,
            address.amenity,
            address.shop,
            address.tourism,
            address.club,
            address.road,
            address.suburb,
            address.village,
            address.town,
            address.city
          ].filter(Boolean);

          if (locationParts.length > 0) {
            // Return first meaningful part, or combine first two if available
            return locationParts.length > 1 
              ? `${locationParts[0]}, ${locationParts[1]}`
              : locationParts[0];
          }
        }
        
        // Fallback to display name, but try to shorten it
        const displayName = data.display_name;
        const parts = displayName.split(',').map((part: string) => part.trim());
        // Return first 2-3 parts to avoid overly long names
        return parts.slice(0, Math.min(3, parts.length)).join(', ');
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.debug('Failed to get place name:', errorMessage);
      return null;
    }
  }
}
