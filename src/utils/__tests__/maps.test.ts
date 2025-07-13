import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { openInMaps, canOpenInMaps } from '../maps';
import type { LocationData } from '@/domain/ports/location';

// Mock the global objects
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
});

Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true
});

describe('canOpenInMaps', () => {
  test('returns true for valid location with coordinates', () => {
    const location: LocationData = {
      latitude: 51.5074,
      longitude: -0.1278,
      placeName: 'London',
      timestamp: Date.now()
    };

    expect(canOpenInMaps(location)).toBe(true);
  });

  test('returns false for location without coordinates', () => {
    const location: LocationData = {
      latitude: 0,
      longitude: 0,
      placeName: 'Unknown',
      timestamp: Date.now()
    };

    expect(canOpenInMaps(location)).toBe(false);
  });

  test('returns false for null location', () => {
    expect(canOpenInMaps(null)).toBe(false);
  });

  test('returns false for undefined location', () => {
    expect(canOpenInMaps(undefined)).toBe(false);
  });

  test('returns false for location with missing latitude', () => {
    const location = {
      longitude: -0.1278,
      placeName: 'London',
      timestamp: Date.now()
    } as LocationData;

    expect(canOpenInMaps(location)).toBe(false);
  });

  test('returns false for location with missing longitude', () => {
    const location = {
      latitude: 51.5074,
      placeName: 'London',
      timestamp: Date.now()
    } as LocationData;

    expect(canOpenInMaps(location)).toBe(false);
  });
});

describe('openInMaps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.href
    window.location.href = '';
    
    // Mock DOM methods
    document.createElement = vi.fn().mockReturnValue({
      style: {},
      src: '',
      remove: vi.fn()
    });
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
    
    // Mock setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('opens Apple Maps on iOS devices', () => {
    // Mock iOS user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true
    });

    const location: LocationData = {
      latitude: 51.5074,
      longitude: -0.1278,
      placeName: 'London Archery Club',
      timestamp: Date.now()
    };

    openInMaps(location);

    expect(window.location.href).toContain('maps://maps.apple.com/');
    expect(window.location.href).toContain('ll=51.5074,-0.1278');
    expect(window.location.href).toContain('London%20Archery%20Club');
  });

  test('tries Google Maps app then web fallback on non-iOS devices', () => {
    // Mock Android user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10)',
      configurable: true
    });

    const location: LocationData = {
      latitude: 51.5074,
      longitude: -0.1278,
      placeName: 'London Archery Club',
      timestamp: Date.now()
    };

    openInMaps(location);

    // Should create iframe for Google Maps app
    expect(document.createElement).toHaveBeenCalledWith('iframe');
    expect(document.body.appendChild).toHaveBeenCalled();

    // Fast-forward timer to trigger web fallback
    vi.advanceTimersByTime(500);

    expect(document.body.removeChild).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://maps.google.com/maps'),
      '_blank'
    );
  });

  test('handles location without place name', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true
    });

    const location: LocationData = {
      latitude: 51.5074,
      longitude: -0.1278,
      timestamp: Date.now()
    };

    openInMaps(location);

    expect(window.location.href).toContain('maps://maps.apple.com/');
    expect(window.location.href).toContain('ll=51.5074,-0.1278');
    // Should not contain place name query
    expect(window.location.href).toContain('q=&');
  });
});
