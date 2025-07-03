// services/MapService.ts - High-level map service
import { mapboxAPI, PREDEFINED_LOCATIONS } from '@/utils/mapbox';
import { 
  GeocodingResult, 
  DirectionsResult, 
  LocationSuggestion, 
  CurrentLocation,
  MapServiceResponse 
} from '@/types/map';

class MapService {
  private cache = new Map<string, any>();
  private debounceTimers: Record<string, NodeJS.Timeout> = {};

  // ========================
  // CORE MAP FUNCTIONALITY
  // ========================

  /**
   * Geocode an address with caching and fallback
   */
  async geocodeAddress(address: string, options: {
    country?: string;
    proximity?: string;
    limit?: number;
  } = {}): Promise<GeocodingResult | null> {
    const cacheKey = `geocode-${address.toLowerCase()}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Try Mapbox API first
      const result = await mapboxAPI.geocodeAddress(address, {
        country: 'PK',
        proximity: '74.331627,31.522381', // FCC coordinates
        ...options
      });

      if (result.success && result.data && result.data.length > 0) {
        const bestMatch = result.data[0];
        const response: GeocodingResult = {
          coordinates: bestMatch.coordinates,
          address: bestMatch.name,
          type: bestMatch.type,
          relevance: bestMatch.relevance
        };
        
        // Cache for 1 hour
        this.cache.set(cacheKey, response);
        setTimeout(() => this.cache.delete(cacheKey), 3600000);
        
        return response;
      }

      // Fallback to predefined locations
      const predefined = this.findPredefinedLocation(address);
      if (predefined) {
        return {
          coordinates: predefined.coordinates,
          address: predefined.address,
          type: predefined.type,
          relevance: 0.9,
          isFallback: true
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Get directions with traffic consideration
   */
  async getDirections(origin: [number, number], destination: [number, number], profile: string = 'driving'): Promise<DirectionsResult | null> {
    const cacheKey = `directions-${profile}-${origin.join(',')}-${destination.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await mapboxAPI.getDirections(origin, destination, {
        annotations: ['distance', 'duration', 'congestion'],
        overview: 'full',
        steps: true
      });

      if (result.success && result.data) {
        const response: DirectionsResult = {
          coordinates: result.data.coordinates,
          distance: result.data.distance,
          duration: result.data.duration,
          steps: result.data.steps,
          congestion: result.data.congestion
        };
        
        // Cache for 15 minutes
        this.cache.set(cacheKey, response);
        setTimeout(() => this.cache.delete(cacheKey), 900000);
        
        return response;
      }

      return null;
    } catch (error) {
      console.error('Directions error:', error);
      return null;
    }
  }

  // ========================
  // LOCATION SERVICES
  // ========================

  /**
   * Get current location with high accuracy
   */
  async getCurrentLocation(): Promise<CurrentLocation | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }),
        error => {
          console.error('GPS error:', error);
          reject(new Error(this.getGeolocationError(error.code)));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Track location continuously
   */
  trackLocation(callback: (location: CurrentLocation) => void, options: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  } = {}): () => void {
    const watchId = navigator.geolocation.watchPosition(
      position => callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      }),
      error => console.error('Tracking error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        ...options
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }

  // ========================
  // LOCATION SUGGESTIONS
  // ========================

  /**
   * Get address suggestions with debouncing
   */
  async getAddressSuggestions(query: string, options: {
    country?: string;
    proximity?: string;
    limit?: number;
  } = {}): Promise<LocationSuggestion[]> {
    // Clear existing timer
    if (this.debounceTimers[query]) {
      clearTimeout(this.debounceTimers[query]);
    }

    return new Promise((resolve) => {
      this.debounceTimers[query] = setTimeout(async () => {
        try {
          const suggestions: LocationSuggestion[] = [];

          // Get API suggestions
          const apiSuggestions = await mapboxAPI.getAddressSuggestions(query, {
            country: 'PK',
            proximity: '74.331627,31.522381',
            limit: 5,
            ...options
          });

          suggestions.push(...apiSuggestions);

          // Add predefined location matches
          const predefinedMatches = this.findPredefinedLocationMatches(query);
          suggestions.push(...predefinedMatches);

          // Remove duplicates and sort by relevance
          const uniqueSuggestions = this.removeDuplicateSuggestions(suggestions);
          resolve(uniqueSuggestions);
        } catch (error) {
          console.error('Address suggestions error:', error);
          resolve([]);
        }
      }, 300); // 300ms debounce
    });
  }

  /**
   * Find predefined location matches
   */
  private findPredefinedLocationMatches(query: string): LocationSuggestion[] {
    const normalizedQuery = query.toLowerCase().trim();
    const matches: LocationSuggestion[] = [];

    for (const [key, location] of Object.entries(PREDEFINED_LOCATIONS)) {
      if (
        key.toLowerCase().includes(normalizedQuery) ||
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.address.toLowerCase().includes(normalizedQuery)
      ) {
        matches.push({
          name: location.name,
          coordinates: location.coordinates,
          type: location.type,
          relevance: 0.9,
          isFallback: true
        });
      }
    }

    return matches;
  }

  /**
   * Remove duplicate suggestions
   */
  private removeDuplicateSuggestions(suggestions: LocationSuggestion[]): LocationSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.coordinates[0]},${suggestion.coordinates[1]}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    }).sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }

  // ========================
  // UTILITY METHODS
  // ========================

  /**
   * Find predefined location by name
   */
  findPredefinedLocation(query: string) {
    return mapboxAPI.findPredefinedLocation(query);
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1: [number, number], point2: [number, number]): number {
    return mapboxAPI.calculateDistance(point1, point2);
  }

  /**
   * Get geolocation error message
   */
  private getGeolocationError(code: number): string {
    switch (code) {
      case 1:
        return 'Permission denied';
      case 2:
        return 'Location unavailable';
      case 3:
        return 'Request timeout';
      default:
        return 'Unknown error';
    }
  }

  /**
   * Test API connectivity
   */
  async testAPI(): Promise<boolean> {
    return await mapboxAPI.testAPI();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get predefined locations
   */
  getPredefinedLocations() {
    return PREDEFINED_LOCATIONS;
  }
}

// Export singleton instance
export const mapService = new MapService();