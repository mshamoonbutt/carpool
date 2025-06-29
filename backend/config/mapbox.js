/**
 * Mapbox Configuration and API Integration
 * Handles all Mapbox API configurations, endpoints, and utilities
 */

// Environment variables (should be set in .env file)
const MAPBOX_CONFIG = {
  // Primary Mapbox Access Token
  ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic2hvY2tlZHJ1bWJsZSIsImEiOiJjbHlycDVwZjEwNnViMmxyMDJ2NXlpeWRiIn0.q8928pDyTpw51xqJouSQrQ',
  
  // API Base URLs
  BASE_URL: 'https://api.mapbox.com',
  GEOCODING_URL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  DIRECTIONS_URL: 'https://api.mapbox.com/directions/v5/mapbox/driving',
  MATRIX_URL: 'https://api.mapbox.com/directions-matrix/v1/mapbox/driving',
  
  // Default settings for Lahore, Pakistan
  DEFAULT_REGION: 'PK',
  DEFAULT_COUNTRY: 'Pakistan',
  DEFAULT_CITY: 'Lahore',
  DEFAULT_BOUNDS: {
    minLng: 74.2,
    maxLng: 74.5,
    minLat: 31.4,
    maxLat: 31.6
  },
  
  // FCC University coordinates (main campus)
  FCC_COORDINATES: {
    lat: 31.522381,
    lng: 74.331627,
    name: 'FCC University',
    address: 'FCC University, Lahore, Pakistan'
  },
  
  // Common locations in Lahore
  COMMON_LOCATIONS: {
    'FCC University': {
      name: 'FCC University',
      coordinates: [74.331627, 31.522381],
      address: 'FCC University, Lahore, Pakistan',
      type: 'university'
    },
    'Model Town': {
      name: 'Model Town',
      coordinates: [74.3436, 31.4662],
      address: 'Model Town, Lahore, Pakistan',
      type: 'residential'
    },
    'DHA Phase 1': {
      name: 'DHA Phase 1',
      coordinates: [74.3902, 31.4831],
      address: 'DHA Phase 1, Lahore, Pakistan',
      type: 'residential'
    },
    'DHA Phase 2': {
      name: 'DHA Phase 2',
      coordinates: [74.3850, 31.4800],
      address: 'DHA Phase 2, Lahore, Pakistan',
      type: 'residential'
    },
    'DHA Phase 3': {
      name: 'DHA Phase 3',
      coordinates: [74.3800, 31.4770],
      address: 'DHA Phase 3, Lahore, Pakistan',
      type: 'residential'
    },
    'DHA Phase 4': {
      name: 'DHA Phase 4',
      coordinates: [74.3750, 31.4740],
      address: 'DHA Phase 4, Lahore, Pakistan',
      type: 'residential'
    },
    'DHA Phase 5': {
      name: 'DHA Phase 5',
      coordinates: [74.3700, 31.4710],
      address: 'DHA Phase 5, Lahore, Pakistan',
      type: 'residential'
    },
    'Gulberg III': {
      name: 'Gulberg III',
      coordinates: [74.3600, 31.5200],
      address: 'Gulberg III, Lahore, Pakistan',
      type: 'residential'
    },
    'Gulberg IV': {
      name: 'Gulberg IV',
      coordinates: [74.3550, 31.5170],
      address: 'Gulberg IV, Lahore, Pakistan',
      type: 'residential'
    },
    'Jail Road': {
      name: 'Jail Road',
      coordinates: [74.3400, 31.5300],
      address: 'Jail Road, Lahore, Pakistan',
      type: 'commercial'
    },
    'Mall Road': {
      name: 'Mall Road',
      coordinates: [74.3500, 31.5400],
      address: 'Mall Road, Lahore, Pakistan',
      type: 'commercial'
    },
    'Lahore Airport': {
      name: 'Allama Iqbal International Airport',
      coordinates: [74.4036, 31.5216],
      address: 'Allama Iqbal International Airport, Lahore, Pakistan',
      type: 'transport'
    },
    'Lahore Railway Station': {
      name: 'Lahore Railway Station',
      coordinates: [74.2647, 31.5820],
      address: 'Lahore Railway Station, Lahore, Pakistan',
      type: 'transport'
    }
  },
  
  // API Rate limiting
  RATE_LIMITS: {
    requestsPerMinute: 300,
    requestsPerHour: 10000,
    maxConcurrentRequests: 10
  },
  
  // Cache settings
  CACHE: {
    geocoding: 3600, // 1 hour
    directions: 1800, // 30 minutes
    matrix: 900, // 15 minutes
    enabled: true
  }
};

/**
 * Mapbox API Utility Functions
 */
class MapboxAPI {
  constructor() {
    this.config = MAPBOX_CONFIG;
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
  }

  /**
   * Build URL with authentication
   */
  buildURL(endpoint, params = {}) {
    const url = new URL(endpoint, this.config.BASE_URL);
    url.searchParams.set('access_token', this.config.ACCESS_TOKEN);
    
    // Add default parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  }

  /**
   * Rate limiting check
   */
  checkRateLimit() {
    const now = Date.now();
    const timeDiff = now - this.lastRequestTime;
    
    if (timeDiff < 60000) { // Within 1 minute
      if (this.requestCount >= this.config.RATE_LIMITS.requestsPerMinute) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    } else {
      this.requestCount = 0;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
  }

  /**
   * Geocoding: Convert address to coordinates
   */
  async geocodeAddress(address, options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        country: options.country || this.config.DEFAULT_REGION,
        types: options.types || 'address,poi,neighborhood',
        limit: options.limit || 5,
        bbox: options.bbox || `${this.config.DEFAULT_BOUNDS.minLng},${this.config.DEFAULT_BOUNDS.minLat},${this.config.DEFAULT_BOUNDS.maxLng},${this.config.DEFAULT_BOUNDS.maxLat}`,
        proximity: options.proximity || `${this.config.FCC_COORDINATES.lng},${this.config.FCC_COORDINATES.lat}`
      };

      const url = this.buildURL(this.config.GEOCODING_URL + `/${encodeURIComponent(address)}.json`, params);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Mapbox API Error: ${data.message || 'Unknown error'}`);
      }

      return {
        success: true,
        data: data.features || [],
        query: address,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error.message,
        query: address,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Reverse Geocoding: Convert coordinates to address
   */
  async reverseGeocode(lng, lat, options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        types: options.types || 'address,poi,neighborhood',
        limit: options.limit || 1
      };

      const url = this.buildURL(`${this.config.GEOCODING_URL}/${lng},${lat}.json`, params);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Mapbox API Error: ${data.message || 'Unknown error'}`);
      }

      return {
        success: true,
        data: data.features || [],
        coordinates: [lng, lat],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: error.message,
        coordinates: [lng, lat],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get driving directions between two points
   */
  async getDirections(origin, destination, options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        alternatives: options.alternatives || false,
        annotations: options.annotations || 'distance,duration',
        continue_straight: options.continueStraight || true,
        overview: options.overview || 'full',
        steps: options.steps || true
      };

      const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
      const url = this.buildURL(`${this.config.DIRECTIONS_URL}/${coordinates}.json`, params);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Mapbox API Error: ${data.message || 'Unknown error'}`);
      }

      return {
        success: true,
        data: data.routes || [],
        origin,
        destination,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Directions error:', error);
      return {
        success: false,
        error: error.message,
        origin,
        destination,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get distance matrix for multiple points
   */
  async getDistanceMatrix(coordinates, options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        annotations: options.annotations || 'distance,duration'
      };

      const coordsString = coordinates.map(coord => `${coord.lng},${coord.lat}`).join(';');
      const url = this.buildURL(`${this.config.MATRIX_URL}/${coordsString}.json`, params);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Mapbox API Error: ${data.message || 'Unknown error'}`);
      }

      return {
        success: true,
        data: data,
        coordinates,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Distance matrix error:', error);
      return {
        success: false,
        error: error.message,
        coordinates,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search for locations with autocomplete
   */
  async searchLocations(query, options = {}) {
    try {
      this.checkRateLimit();
      
      const params = {
        country: options.country || this.config.DEFAULT_REGION,
        types: options.types || 'address,poi,neighborhood',
        limit: options.limit || 8,
        bbox: options.bbox || `${this.config.DEFAULT_BOUNDS.minLng},${this.config.DEFAULT_BOUNDS.minLat},${this.config.DEFAULT_BOUNDS.maxLng},${this.config.DEFAULT_BOUNDS.maxLat}`,
        proximity: options.proximity || `${this.config.FCC_COORDINATES.lng},${this.config.FCC_COORDINATES.lat}`
      };

      const url = this.buildURL(this.config.GEOCODING_URL + `/${encodeURIComponent(query)}.json`, params);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Mapbox API Error: ${data.message || 'Unknown error'}`);
      }

      // Combine with predefined locations
      const predefinedMatches = Object.entries(this.config.COMMON_LOCATIONS)
        .filter(([name, location]) => 
          name.toLowerCase().includes(query.toLowerCase()) ||
          location.address.toLowerCase().includes(query.toLowerCase())
        )
        .map(([name, location]) => ({
          ...location,
          source: 'predefined',
          relevance: 1.0
        }));

      const apiResults = data.features.map(feature => ({
        name: feature.place_name,
        coordinates: feature.center,
        address: feature.place_name,
        type: feature.place_type[0],
        source: 'api',
        relevance: feature.relevance
      }));

      const allResults = [...predefinedMatches, ...apiResults];
      const sortedResults = allResults.sort((a, b) => (b.relevance || 1) - (a.relevance || 1));

      return {
        success: true,
        data: sortedResults.slice(0, options.limit || 8),
        query,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Location search error:', error);
      return {
        success: false,
        error: error.message,
        query,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return {
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      unit: 'km'
    };
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get common locations
   */
  getCommonLocations() {
    return this.config.COMMON_LOCATIONS;
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Get FCC University coordinates
   */
  getFCCCoordinates() {
    return this.config.FCC_COORDINATES;
  }

  /**
   * Get default bounds
   */
  getDefaultBounds() {
    return this.config.DEFAULT_BOUNDS;
  }
}

// Export configuration and API instance
module.exports = {
  config: MAPBOX_CONFIG,
  MapboxAPI,
  api: new MapboxAPI()
}; 