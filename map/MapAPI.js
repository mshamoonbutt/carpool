// contracts/MapAPI.js
export const MapAPI = {
  // Geocoding Services
  geocodeAddress: async (address) => {
    /**
     * @param {string} address - Address to geocode
     * @returns {Promise<{coordinates: [number, number], address: string, type: string}>}
     */
  },

  getAddressSuggestions: async (query) => {
    /**
     * @param {string} query - Search query
     * @returns {Promise<Array<{name: string, address: string, coordinates: [number, number], type: string}>>}
     */
  },

  // Routing Services
  getDirections: async (origin, destination) => {
    /**
     * @param {[number, number]} origin - [lng, lat]
     * @param {[number, number]} destination - [lng, lat]
     * @returns {Promise<{
     *   coordinates: Array<[number, number]>,
     *   distance: number,
     *   duration: number,
     *   steps: Array<Object>,
     *   congestion: Array<number>
     * }>}
     */
  },

  optimizeRoute: async (waypoints) => {
    /**
     * @param {Array<[number, number]>} waypoints - Array of [lng, lat]
     * @returns {Promise<{
     *   waypoints: Array<[number, number]>,
     *   legs: Array<Object>,
     *   totalDistance: number,
     *   totalDuration: number
     * }>}
     */
  },

  // Location Services
  getCurrentLocation: async () => {
    /**
     * @returns {Promise<{lat: number, lng: number, accuracy: number, timestamp: number}>}
     */
  },

  trackLocation: async (callback) => {
    /**
     * @param {Function} callback - Callback with position updates
     * @returns {Function} - Function to stop tracking
     */
  },

  // Utility Methods
  calculateDistance: (point1, point2) => {
    /**
     * @param {[number, number]} point1 - [lng, lat]
     * @param {[number, number]} point2 - [lng, lat]
     * @returns {number} - Distance in km
     */
  },

  findNearbyLocations: (center, radius) => {
    /**
     * @param {[number, number]} center - [lng, lat]
     * @param {number} radius - Radius in km
     * @returns {Array<{name: string, coordinates: [number, number], distance: number}>}
     */
  }
};

export const MapEvents = {
  LOCATION_UPDATED: 'locationUpdated',
  ROUTE_CALCULATED: 'routeCalculated',
  ADDRESS_SELECTED: 'addressSelected',
  TRACKING_STARTED: 'trackingStarted',
  TRACKING_STOPPED: 'trackingStopped'
};

export const MapErrors = {
  GEOLOCATION_DENIED: 'Permission denied',
  GEOLOCATION_UNAVAILABLE: 'Location unavailable',
  GEOLOCATION_TIMEOUT: 'Request timeout',
  GEOCODING_FAILED: 'Address not found',
  ROUTING_FAILED: 'No route available',
  OPTIMIZATION_FAILED: 'Route optimization failed'
};