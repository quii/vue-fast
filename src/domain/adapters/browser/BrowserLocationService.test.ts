import { BrowserLocationService } from './BrowserLocationService.js';
import { beforeEach, describe, expect, test, vi, afterEach } from 'vitest';

describe('BrowserLocationService', () => {
  let service: BrowserLocationService;
  let mockGeolocation: any;

  beforeEach(() => {
    service = new BrowserLocationService();
    
    // Mock geolocation
    mockGeolocation = {
      getCurrentPosition: vi.fn()
    };
    
    // @ts-ignore
    global.navigator = {
      geolocation: mockGeolocation
    };

    // Mock fetch for place name requests
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentLocation', () => {
    test('returns location data when geolocation succeeds', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
        success(mockPosition);
      });

      // Mock successful place name fetch
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          display_name: 'Test Place, London, UK',
          address: {
            building: 'Test Building',
            road: 'Test Road'
          }
        })
      });

      const result = await service.getCurrentLocation();

      expect(result).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
        placeName: 'Test Building, Test Road',
        timestamp: expect.any(Number)
      });
    });

    test('returns null when geolocation is not supported', async () => {
      // @ts-ignore
      global.navigator = {};

      const result = await service.getCurrentLocation();

      expect(result).toBeNull();
    });

    test('returns null when geolocation fails', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success: any, error: any) => {
        error(new Error('Position unavailable'));
      });

      const result = await service.getCurrentLocation();

      expect(result).toBeNull();
    });

    test('returns location with undefined placeName when place name fetch fails', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
        success(mockPosition);
      });

      // Mock failed place name fetch
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getCurrentLocation();

      expect(result).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
        placeName: undefined,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('getPlaceName', () => {
    test('returns formatted place name from address components', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          display_name: 'Full Address, London, UK',
          address: {
            building: 'Archery Club',
            road: 'Sports Road'
          }
        })
      });

      const result = await service.getPlaceName(51.5074, -0.1278);

      expect(result).toBe('Archery Club, Sports Road');
    });

    test('returns shortened display name when no address components available', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          display_name: 'First Part, Second Part, Third Part, Fourth Part',
          address: {}
        })
      });

      const result = await service.getPlaceName(51.5074, -0.1278);

      expect(result).toBe('First Part, Second Part, Third Part');
    });

    test('returns null when API request fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getPlaceName(51.5074, -0.1278);

      expect(result).toBeNull();
    });

    test('returns null when API returns non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await service.getPlaceName(51.5074, -0.1278);

      expect(result).toBeNull();
    });
  });
});
