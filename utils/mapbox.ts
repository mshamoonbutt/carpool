// utils/mapbox.ts - Mapbox API utilities
import { 
  GeocodingResult, 
  DirectionsResult, 
  LocationSuggestion, 
  MapServiceResponse,
  PredefinedLocation 
} from '@/types/map';

// Initialize Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2hvY2tlZHJ1bWJsZSIsImEiOiJjbHlycDVwZjEwNnViMmxyMDJ2NXlpeWRiIn0.q8928pDyTpw51xqJouSQrQ';

// Predefined locations for Lahore area
export const PREDEFINED_LOCATIONS: Record<string, PredefinedLocation> = {
  'FCC University': {
    name: 'FCC University',
    coordinates: [74.331627, 31.522381],
    type: 'university',
    address: 'FCC University, Lahore, Pakistan'
  },
  'DHA Phase 1': {
    name: 'DHA Phase 1',
    coordinates: [74.3667, 31.4667],
    type: 'residential',
    address: 'DHA Phase 1, Lahore, Pakistan'
  },
  'Gulberg III': {
    name: 'Gulberg III',
    coordinates: [74.3333, 31.5167],
    type: 'residential',
    address: 'Gulberg III, Lahore, Pakistan'
  },
  'Model Town': {
    name: 'Model Town',
    coordinates: [74.3167, 31.4833],
    type: 'residential',
    address: 'Model Town, Lahore, Pakistan'
  },
  'Lahore Airport': {
    name: 'Lahore Airport',
    coordinates: [74.4036, 31.5216],
    type: 'airport',
    address: 'Allama Iqbal International Airport, Lahore, Pakistan'
  },
  'Lahore Railway Station': {
    name: 'Lahore Railway Station',
    coordinates: [74.2647, 31.5820],
    type: 'transport',
    address: 'Lahore Railway Station, Lahore, Pakistan'
  }
};

export class MapboxAPI {
  private accessToken: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || MAPBOX_ACCESS_TOKEN;
  }

  /**
   * Geocode an address using Mapbox API
   */
  async geocodeAddress(address: string, options: {
    country?: string;
    proximity?: string;
    limit?: number;
  } = {}): Promise<MapServiceResponse> {
    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        limit: (options.limit || 5).toString(),
        country: options.country || 'PK',
        ...(options.proximity && { proximity: options.proximity })
      });

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?${params}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return {
          success: true,
          data: data.features.map((feature: any) => ({
            name: feature.place_name,
            coordinates: feature.center,
            type: feature.place_type[0],
            relevance: feature.relevance
          }))
        };
      }

      return {
        success: false,
        error: 'No results found'
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get address suggestions for autocomplete
   */
  async getAddressSuggestions(query: string, options: {
    country?: string;
    proximity?: string;
    limit?: number;
  } = {}): Promise<LocationSuggestion[]> {
    try {
      const result = await this.geocodeAddress(query, options);
      
      if (result.success && result.data) {
        return result.data as LocationSuggestion[];
      }

      return [];
    } catch (error) {
      console.error('Address suggestions error:', error);
      return [];
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(
    origin: [number, number], 
    destination: [number, number], 
    options: {
      profile?: string;
      annotations?: string[];
      overview?: string;
      steps?: boolean;
    } = {}
  ): Promise<MapServiceResponse> {
    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        geometries: 'geojson',
        overview: options.overview || 'full',
        steps: (options.steps || false).toString(),
        ...(options.annotations && { annotations: options.annotations.join(',') })
      });

      const profile = options.profile || 'driving';
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?${params}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          success: true,
          data: {
            coordinates: route.geometry.coordinates,
            distance: route.distance / 1000, // Convert to km
            duration: route.duration / 60, // Convert to minutes
            steps: route.legs[0]?.steps || [],
            congestion: route.legs[0]?.annotation?.congestion || []
          }
        };
      }

      return {
        success: false,
        error: 'No route found'
      };
    } catch (error) {
      console.error('Directions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate distance matrix between multiple points
   */
  async getDistanceMatrix(
    coordinates: [number, number][], 
    options: {
      profile?: string;
      annotations?: string[];
    } = {}
  ): Promise<MapServiceResponse> {
    try {
      if (coordinates.length < 2) {
        throw new Error('Need at least 2 coordinates');
      }

      const params = new URLSearchParams({
        access_token: this.accessToken,
        annotations: (options.annotations || ['distance', 'duration']).join(','),
        ...(options.profile && { profile: options.profile })
      });

      const coordsString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${options.profile || 'driving'}/${coordsString}?${params}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          distances: data.distances,
          durations: data.durations,
          destinations: data.destinations,
          sources: data.sources
        }
      };
    } catch (error) {
      console.error('Distance matrix error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Find predefined location by name
   */
  findPredefinedLocation(query: string): PredefinedLocation | null {
    const normalizedQuery = query.toLowerCase().trim();
    
    for (const [key, location] of Object.entries(PREDEFINED_LOCATIONS)) {
      if (
        key.toLowerCase().includes(normalizedQuery) ||
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.address.toLowerCase().includes(normalizedQuery)
      ) {
        return location;
      }
    }
    
    return null;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(point2[1] - point1[1]);
    const dLng = this.toRadians(point2[0] - point1[0]);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1[1])) * Math.cos(this.toRadians(point2[1])) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Test Mapbox API connectivity
   */
  async testAPI(): Promise<boolean> {
    try {
      const result = await this.geocodeAddress('Lahore', { limit: 1 });
      return result.success;
    } catch (error) {
      console.error('Mapbox API test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mapboxAPI = new MapboxAPI();

// Export constants
export const MAP_EVENTS = {
  LOCATION_UPDATED: 'locationUpdated',
  ROUTE_CALCULATED: 'routeCalculated',
  ADDRESS_SELECTED: 'addressSelected',
  TRACKING_STARTED: 'trackingStarted',
  TRACKING_STOPPED: 'trackingStopped'
} as const;

export const MAP_ERRORS = {
  GEOLOCATION_DENIED: 'Permission denied',
  GEOLOCATION_UNAVAILABLE: 'Location unavailable',
  GEOLOCATION_TIMEOUT: 'Request timeout',
  GEOCODING_FAILED: 'Address not found',
  ROUTING_FAILED: 'No route available',
  OPTIMIZATION_FAILED: 'Route optimization failed'
} as const; 