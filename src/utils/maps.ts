import type { LocationData } from '@/domain/ports/location';

/**
 * Opens the device's map application at the specified coordinates
 * @param location The location data containing coordinates and place name
 */
export function openInMaps(location: LocationData): void {
  const { latitude, longitude, placeName } = location;
  
  // Create a query parameter for the place name if available
  const query = placeName ? encodeURIComponent(placeName) : '';
  
  // Try different map URL schemes in order of preference
  const mapUrls = [
    // Apple Maps (iOS) - most specific first
    `maps://maps.apple.com/?q=${query}&ll=${latitude},${longitude}&z=16`,
    
    // Google Maps app (if installed)
    `comgooglemaps://?q=${latitude},${longitude}&zoom=16`,
    
    // Universal web fallback that works on all devices
    `https://maps.google.com/maps?q=${latitude},${longitude}&z=16${query ? `&t=k&hl=en&gl=us&mapclient=embed&cid=${query}` : ''}`
  ];

  // Detect if we're on iOS for better Apple Maps integration
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // On iOS, try Apple Maps first
    window.location.href = mapUrls[0];
  } else {
    // On Android/other platforms, try Google Maps app, then web fallback
    const googleMapsApp = mapUrls[1];
    const webFallback = mapUrls[2];
    
    // Try to open the Google Maps app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = googleMapsApp;
    document.body.appendChild(iframe);
    
    // Fallback to web version after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
      window.open(webFallback, '_blank');
    }, 500);
  }
}

/**
 * Checks if the location has valid coordinates for opening in maps
 * @param location The location data to check
 * @returns True if the location can be opened in maps
 */
export function canOpenInMaps(location: LocationData | null | undefined): boolean {
  return !!(location?.latitude && location?.longitude);
}
