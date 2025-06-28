import DataService from './DataService';

// Simulating async API behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * AIService - Handles AI-related features
 */
class AIService {
  /**
   * Parse and normalize a location string
   * @param {string} locationText The text to parse
   * @returns {Promise<Object>} Normalized location data
   */
  static async parseLocation(locationText) {
    // Simulate API delay for AI processing
    await delay(500);
    
    // Simple location normalization logic
    // In a real app, this would call an AI API
    
    // Common area aliases in Lahore
    const areaAliases = {
      'dha': 'DHA',
      'defence': 'DHA',
      'gulberg': 'Gulberg',
      'model town': 'Model Town',
      'johar town': 'Johar Town',
      'fcc': 'FCC',
      'forman christian college': 'FCC',
      'fc college': 'FCC'
    };
    
    // Clean up input text
    const cleanText = locationText.toLowerCase().trim();
    
    // Check for direct matches in aliases
    for (const [alias, normalized] of Object.entries(areaAliases)) {
      if (cleanText.includes(alias)) {
        return {
          normalized,
          confidence: 0.9,
          original: locationText
        };
      }
    }
    
    // Areas with phases
    if (cleanText.includes('dha') || cleanText.includes('defence')) {
      // Extract phase number if present
      const phaseMatch = cleanText.match(/phase\s*(\d+)/i);
      if (phaseMatch && phaseMatch[1]) {
        return {
          normalized: `DHA Phase ${phaseMatch[1]}`,
          confidence: 0.95,
          original: locationText
        };
      }
      
      return {
        normalized: 'DHA',
        confidence: 0.7,
        original: locationText
      };
    }
    
    // No specific match, return original with low confidence
    return {
      normalized: locationText,
      confidence: 0.5,
      original: locationText
    };
  }
  
  /**
   * Get personalized ride recommendations for a user
   * @param {string} userId The user ID
   * @returns {Promise<Array>} Recommended rides
   */
  static async getRecommendations(userId) {
    // Simulate API delay for processing
    await delay(400);
    
    const user = DataService.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all available rides
    const allRides = DataService.getAllRides();
    
    // Get user's booking history
    const bookings = DataService.getAllBookings({ riderId: userId });
    
    // Extract common patterns from user's history
    const patterns = this.extractUserPatterns(bookings, allRides);
    
    // Find rides that match user's patterns
    return this.findMatchingRides(patterns, allRides, userId);
  }
  
  /**
   * Extract patterns from a user's booking history
   * @param {Array} bookings The user's bookings
   * @param {Array} allRides All rides in the system
   * @returns {Object} Patterns found
   */
  static extractUserPatterns(bookings, allRides) {
    // Get full ride details for each booking
    const rides = bookings.map(booking => {
      return allRides.find(ride => ride.id === booking.rideId);
    }).filter(ride => ride !== undefined);
    
    // Initialize patterns object
    const patterns = {
      commonPickups: {},
      commonDropoffs: {},
      commonTimes: {
        morning: 0,
        afternoon: 0,
        evening: 0
      },
      commonDrivers: {},
      commonDays: {
        'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
      }
    };
    
    // Process each ride to extract patterns
    rides.forEach(ride => {
      // Count pickups
      patterns.commonPickups[ride.pickup] = (patterns.commonPickups[ride.pickup] || 0) + 1;
      
      // Count dropoffs
      patterns.commonDropoffs[ride.dropoff] = (patterns.commonDropoffs[ride.dropoff] || 0) + 1;
      
      // Count times of day
      const hour = new Date(ride.departureTime).getHours();
      if (hour >= 5 && hour < 12) {
        patterns.commonTimes.morning += 1;
      } else if (hour >= 12 && hour < 17) {
        patterns.commonTimes.afternoon += 1;
      } else {
        patterns.commonTimes.evening += 1;
      }
      
      // Count drivers
      patterns.commonDrivers[ride.driverId] = (patterns.commonDrivers[ride.driverId] || 0) + 1;
      
      // Count days of week
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(ride.departureTime).getDay()];
      patterns.commonDays[day] += 1;
    });
    
    return patterns;
  }
  
  /**
   * Find rides that match a user's patterns
   * @param {Object} patterns The user's patterns
   * @param {Array} allRides All rides in the system
   * @param {string} userId The user ID
   * @returns {Array} Matching rides
   */
  static findMatchingRides(patterns, allRides, userId) {
    // Get most common pickup and dropoff
    const mostCommonPickup = Object.entries(patterns.commonPickups)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0];
      
    const mostCommonDropoff = Object.entries(patterns.commonDropoffs)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0];
      
    // Get most common time of day
    const mostCommonTime = Object.entries(patterns.commonTimes)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0];
      
    // Get most common days
    const commonDays = Object.entries(patterns.commonDays)
      .filter(([_, count]) => count > 0)
      .map(([day]) => day);
    
    // Filter rides based on patterns
    let matchingRides = allRides.filter(ride => {
      // Skip rides that the user has already booked
      const alreadyBooked = ride.bookings.some(booking => booking.riderId === userId);
      if (alreadyBooked) return false;
      
      // Skip rides that are full
      if (ride.availableSeats <= 0) return false;
      
      // Skip rides in the past
      if (new Date(ride.departureTime) < new Date()) return false;
      
      // Skip rides where user is the driver
      if (ride.driverId === userId) return false;
      
      // Match based on pickup
      const pickupMatch = ride.pickup === mostCommonPickup || 
                          (ride.route && ride.route.includes(mostCommonPickup));
      
      // Match based on dropoff
      const dropoffMatch = ride.dropoff === mostCommonDropoff;
      
      // Match based on time
      const hour = new Date(ride.departureTime).getHours();
      let timeMatch = false;
      
      if (mostCommonTime === 'morning' && hour >= 5 && hour < 12) {
        timeMatch = true;
      } else if (mostCommonTime === 'afternoon' && hour >= 12 && hour < 17) {
        timeMatch = true;
      } else if (mostCommonTime === 'evening' && hour >= 17 && hour < 22) {
        timeMatch = true;
      }
      
      // Match based on day
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(ride.departureTime).getDay()];
      const dayMatch = commonDays.includes(day);
      
      // Ride must match at least pickup/dropoff and time or day
      return (pickupMatch || dropoffMatch) && (timeMatch || dayMatch);
    });
    
    // Sort by departure time
    matchingRides.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    
    // Return top recommendations
    return matchingRides.slice(0, 5);
  }
  
  /**
   * Estimate journey time between two locations
   * @param {string} pickup Pickup location
   * @param {string} dropoff Dropoff location
   * @returns {Promise<Object>} Estimated journey info
   */
  static async estimateJourneyTime(pickup, dropoff) {
    // Simulate API delay
    await delay(300);
    
    // In a real app, this would call a Maps API or ML model
    // Here, we'll use a simple distance table of common locations
    
    const locationDistances = {
      'DHA': {
        'FCC': 8.5, // km
        'LUMS': 12,
        'UET': 15
      },
      'Gulberg': {
        'FCC': 5,
        'LUMS': 9,
        'UET': 7
      },
      'Johar Town': {
        'FCC': 11,
        'LUMS': 6,
        'UET': 14
      },
      'Model Town': {
        'FCC': 7,
        'LUMS': 4,
        'UET': 9
      }
    };
    
    // Extract base areas
    const pickupArea = pickup.split(' ')[0];
    const dropoffArea = dropoff.split(' ')[0];
    
    // Get distance if available, or use default
    const distance = locationDistances[pickupArea]?.[dropoffArea] || 10; // Default 10km
    
    // Calculate estimated time based on average speed
    const averageSpeed = 30; // km/h (accounting for traffic)
    const timeInMinutes = Math.round((distance / averageSpeed) * 60);
    
    // Traffic patterns by time of day
    const now = new Date();
    const hour = now.getHours();
    let trafficMultiplier = 1;
    
    // Morning rush hour
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
      trafficMultiplier = 1.5; // 50% longer during rush hour
    }
    
    return {
      distance: distance.toFixed(1),
      estimatedMinutes: Math.round(timeInMinutes * trafficMultiplier),
      trafficLevel: trafficMultiplier > 1 ? 'Heavy' : 'Normal'
    };
  }
}

export default AIService;
