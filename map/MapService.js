// services/MapService.js
import { MapboxAPI } from '../utils/mapbox';

class MapService {
  constructor() {
    this.mapbox = new MapboxAPI();
    this.cache = new Map();
    this.debounceTimers = {};
  }

  // ========================
  // CORE MAP FUNCTIONALITY
  // ========================

  /**
   * Geocode an address with caching and fallback
   */
  async geocodeAddress(address, options = {}) {
    const cacheKey = `geocode-${address.toLowerCase()}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Try Mapbox API first
      const result = await this.mapbox.geocodeAddress(address, {
        country: 'PK',
        proximity: '74.331627,31.522381', // FCC coordinates
        ...options
      });

      if (result.success && result.data.length > 0) {
        const bestMatch = result.data[0];
        const response = {
          coordinates: bestMatch.center,
          address: bestMatch.place_name,
          type: bestMatch.place_type[0],
          relevance: bestMatch.relevance
        };
        
        // Cache for 1 hour
        this.cache.set(cacheKey, response, 3600000);
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

      throw new Error('No results found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Get directions with traffic consideration
   */
  async getDirections(origin, destination, profile = 'driving') {
    const cacheKey = `directions-${profile}-${origin.join(',')}-${destination.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.mapbox.getDirections(
        { lng: origin[0], lat: origin[1] },
        { lng: destination[0], lat: destination[1] },
        {
          annotations: ['distance', 'duration', 'congestion'],
          overview: 'full',
          steps: true
        }
      );

      if (result.success && result.data.length > 0) {
        const route = result.data[0];
        const response = {
          coordinates: route.geometry.coordinates,
          distance: route.distance / 1000, // km
          duration: route.duration / 60, // minutes
          steps: route.legs[0].steps,
          congestion: route.legs[0].annotation?.congestion
        };
        
        // Cache for 15 minutes
        this.cache.set(cacheKey, response, 900000);
        return response;
      }

      throw new Error('No route found');
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  // ========================
  // LOCATION SERVICES
  // ========================

  /**
   * Get current location with high accuracy
   */
  async getCurrentLocation() {
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
  trackLocation(callback, options = {}) {
    const watchId = navigator.geolocation.watchPosition(
      position => callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
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
  // ROUTE OPTIMIZATION
  // ========================

  /**
   * Optimize route with multiple waypoints
   */
  async optimizeRoute(waypoints) {
    if (waypoints.length < 2) {
      throw new Error('Need at least 2 waypoints');
    }

    const cacheKey = `optimized-route-${waypoints.map(w => w.join(',')).join('|')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.mapbox.getDistanceMatrix(
        waypoints.map(coord => ({ lng: coord[0], lat: coord[1] })),
        { annotations: ['distance', 'duration'] }
      );

      if (result.success) {
        // Implement traveling salesman algorithm for optimal route
        const optimizedRoute = this.solveTSP(waypoints, result.data.durations);
        
        // Get detailed directions for the optimized route
        const detailedRoute = await this.getDetailedRoute(optimizedRoute);
        
        this.cache.set(cacheKey, detailedRoute, 900000);
        return detailedRoute;
      }

      throw new Error('Route optimization failed');
    } catch (error) {
      console.error('Optimization error:', error);
      throw error;
    }
  }

  // ========================
  // SEARCH & AUTOCOMPLETE
  // ========================

  /**
   * Get address suggestions with debouncing
   */
  async getAddressSuggestions(query, options = {}) {
    // Debounce to avoid excessive API calls
    if (this.debounceTimers[query]) {
      clearTimeout(this.debounceTimers[query]);
    }

    return new Promise(resolve => {
      this.debounceTimers[query] = setTimeout(async () => {
        try {
          const result = await this.mapbox.searchLocations(query, {
            country: 'PK',
            limit: 5,
            proximity: '74.331627,31.522381',
            ...options
          });

          if (result.success) {
            resolve(result.data.map(item => ({
              name: item.name,
              address: item.address,
              coordinates: item.coordinates,
              type: item.type,
              relevance: item.relevance
            })));
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error('Suggestions error:', error);
          resolve([]);
        }
      }, 300); // 300ms debounce
    });
  }

  // ========================
  // UTILITY METHODS
  // ========================

  findPredefinedLocation(query) {
    const common = this.mapbox.getCommonLocations();
    const normalizedQuery = query.toLowerCase();
    
    return Object.values(common).find(loc => 
      loc.name.toLowerCase().includes(normalizedQuery) ||
      loc.address.toLowerCase().includes(normalizedQuery)
    );
  }

  getGeolocationError(code) {
    switch(code) {
      case 1: return 'Location permission denied';
      case 2: return 'Location unavailable';
      case 3: return 'Location request timed out';
      default: return 'Error getting location';
    }
  }

  solveTSP(waypoints, distanceMatrix) {
    // Implement basic traveling salesman algorithm
    // In production, use a more sophisticated algorithm
    if (waypoints.length <= 2) return waypoints;
    
    // Simple nearest neighbor implementation
    const route = [waypoints[0]];
    const remaining = [...waypoints.slice(1)];
    
    while (remaining.length > 0) {
      const last = route[route.length - 1];
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      
      remaining.forEach((point, index) => {
        const distance = this.calculateDistance(last, point);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      
      route.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1);
    }
    
    return route;
  }

  calculateDistance(point1, point2) {
    return this.mapbox.calculateDistance(
      { lng: point1[0], lat: point1[1] },
      { lng: point2[0], lat: point2[1] }
    ).distance;
  }

  async getDetailedRoute(waypoints) {
    const legs = [];
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const leg = await this.getDirections(waypoints[i], waypoints[i+1]);
      legs.push(leg);
    }
    
    return {
      waypoints,
      legs,
      totalDistance: legs.reduce((sum, leg) => sum + leg.distance, 0),
      totalDuration: legs.reduce((sum, leg) => sum + leg.duration, 0)
    };
  }
}

export default new MapService();