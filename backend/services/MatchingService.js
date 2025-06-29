/**
 * MatchingService - Intelligent ride matching for UniPool
 * Handles ride matching algorithms, scoring, and recommendations
 */

const RideRepository = require('../repositories/RideRepository');
const UserRepository = require('../repositories/UserRepository');
const MapService = require('./MapService');

class MatchingService {
  constructor() {
    this.rideRepo = new RideRepository();
    this.userRepo = new UserRepository();
    this.mapService = new MapService();
    
    // Matching algorithm configuration
    this.config = {
      timeWindow: 30 * 60 * 1000, // ±30 minutes
      maxDistance: 5000, // 5km for nearby areas
      ratingThreshold: 4.0,
      maxResults: 20,
      scoringWeights: {
        universityMatch: 0.3,
        timeMatch: 0.25,
        locationMatch: 0.2,
        ratingScore: 0.15,
        routeEfficiency: 0.1
      }
    };
  }

  /**
   * Find matching rides for a rider request
   */
  async findMatches(riderRequest) {
    try {
      // Validate request
      this.validateRiderRequest(riderRequest);

      // Get available rides
      const availableRides = await this.rideRepo.findAvailableRides({
        destination: riderRequest.destination,
        departureTime: riderRequest.departureTime,
        seats: riderRequest.seatsRequested
      });

      if (availableRides.length === 0) {
        return {
          matches: [],
          message: 'No rides available for your request'
        };
      }

      // Apply matching algorithm
      const matches = await this.applyMatchingAlgorithm(riderRequest, availableRides);

      // Enrich matches with additional data
      const enrichedMatches = await this.enrichMatches(matches);

      return {
        matches: enrichedMatches.slice(0, this.config.maxResults),
        totalFound: matches.length,
        searchCriteria: riderRequest
      };
    } catch (error) {
      console.error('MatchingService.findMatches error:', error);
      throw error;
    }
  }

  /**
   * Apply intelligent matching algorithm
   */
  async applyMatchingAlgorithm(riderRequest, availableRides) {
    const matches = [];

    for (const ride of availableRides) {
      const matchScore = await this.calculateMatchScore(riderRequest, ride);
      
      if (matchScore.totalScore > 0) {
        const pickupSuggestions = await this.getPickupSuggestions(riderRequest, ride);
        
        matches.push({
          ride,
          score: matchScore,
          pickupSuggestions,
          matchQuality: this.getMatchQuality(matchScore.totalScore)
        });
      }
    }

    return matches.sort((a, b) => b.score.totalScore - a.score.totalScore);
  }

  /**
   * Calculate comprehensive match score
   */
  async calculateMatchScore(riderRequest, ride) {
    const scores = {};

    // University match (30% weight)
    scores.universityMatch = this.calculateUniversityMatch(riderRequest, ride);

    // Time match (25% weight)
    scores.timeMatch = this.calculateTimeMatch(riderRequest, ride);

    // Location match (20% weight)
    scores.locationMatch = await this.calculateLocationMatch(riderRequest, ride);

    // Rating score (15% weight)
    scores.ratingScore = await this.calculateRatingScore(ride);

    // Route efficiency (10% weight)
    scores.routeEfficiency = await this.calculateRouteEfficiency(riderRequest, ride);

    // Calculate weighted total
    const totalScore = Object.keys(scores).reduce((total, key) => {
      return total + (scores[key] * this.config.scoringWeights[key]);
    }, 0);

    return {
      ...scores,
      totalScore: Math.round(totalScore * 100) / 100
    };
  }

  /**
   * Calculate university match score
   */
  calculateUniversityMatch(riderRequest, ride) {
    if (riderRequest.destination === ride.destination) {
      return 1.0; // Perfect match
    }
    
    // Check if destinations are in same area
    const riderUni = this.extractUniversity(riderRequest.destination);
    const rideUni = this.extractUniversity(ride.destination);
    
    if (riderUni === rideUni) {
      return 0.8; // Same university area
    }
    
    return 0.0; // No match
  }

  /**
   * Calculate time match score
   */
  calculateTimeMatch(riderRequest, ride) {
    const requestTime = new Date(riderRequest.departureTime);
    const rideTime = new Date(ride.departureTime);
    const timeDiff = Math.abs(requestTime - rideTime);
    
    if (timeDiff <= this.config.timeWindow) {
      // Within 30 minutes - calculate score based on proximity
      return 1.0 - (timeDiff / this.config.timeWindow);
    }
    
    return 0.0; // Outside time window
  }

  /**
   * Calculate location match score
   */
  async calculateLocationMatch(riderRequest, ride) {
    try {
      // Calculate distance between pickup points
      const distance = await this.mapService.calculateDistance(
        riderRequest.pickup,
        ride.pickup
      );

      if (distance <= 1000) {
        return 1.0; // Within 1km - perfect match
      } else if (distance <= this.config.maxDistance) {
        return 1.0 - (distance / this.config.maxDistance); // Proportional score
      }
      
      return 0.0; // Too far
    } catch (error) {
      console.error('Error calculating location match:', error);
      return 0.5; // Fallback score
    }
  }

  /**
   * Calculate rating score
   */
  async calculateRatingScore(ride) {
    const driver = await this.userRepo.findById(ride.driverId);
    const rating = driver.rating || 0;
    
    if (rating >= this.config.ratingThreshold) {
      return rating / 5.0; // Normalize to 0-1
    }
    
    return 0.0; // Below threshold
  }

  /**
   * Calculate route efficiency score
   */
  async calculateRouteEfficiency(riderRequest, ride) {
    try {
      // Check if rider's pickup is along driver's route
      const routePoints = ride.route || [ride.pickup, ride.destination];
      const riderPickup = riderRequest.pickup;
      
      // Find closest point on route
      let minDistance = Infinity;
      for (const point of routePoints) {
        const distance = await this.mapService.calculateDistance(riderPickup, point);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
      
      if (minDistance <= 500) {
        return 1.0; // Very close to route
      } else if (minDistance <= 2000) {
        return 0.7; // Moderately close
      }
      
      return 0.3; // Somewhat out of way
    } catch (error) {
      console.error('Error calculating route efficiency:', error);
      return 0.5; // Fallback score
    }
  }

  /**
   * Get pickup suggestions for a ride
   */
  async getPickupSuggestions(riderRequest, ride) {
    try {
      const suggestions = [];
      const routePoints = ride.route || [ride.pickup, ride.destination];
      
      // Find points along route that are close to rider's preferred pickup
      for (const point of routePoints) {
        const distance = await this.mapService.calculateDistance(riderRequest.pickup, point);
        
        if (distance <= 2000) { // Within 2km
          suggestions.push({
            location: point,
            distance: Math.round(distance),
            convenience: distance <= 500 ? 'high' : distance <= 1000 ? 'medium' : 'low'
          });
        }
      }
      
      // Sort by convenience
      return suggestions.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error getting pickup suggestions:', error);
      return [];
    }
  }

  /**
   * Get match quality description
   */
  getMatchQuality(score) {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  }

  /**
   * Enrich matches with additional data
   */
  async enrichMatches(matches) {
    return Promise.all(
      matches.map(async (match) => {
        const driver = await this.userRepo.findById(match.ride.driverId);
        const driverBookings = await this.rideRepo.getBookingsForRide(match.ride.id);
        
        return {
          ...match,
          driver: {
            id: driver.id,
            name: driver.name,
            rating: driver.rating,
            totalRides: driver.totalRides,
            profile: driver.profile
          },
          rideDetails: {
            ...match.ride,
            bookedSeats: driverBookings.length,
            availableSeats: match.ride.seats - driverBookings.length
          }
        };
      })
    );
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId, context = {}) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's ride history
      const userBookings = await this.getUserRideHistory(userId);
      
      // Analyze patterns
      const patterns = this.analyzeUserPatterns(userBookings);
      
      // Find rides matching patterns
      const recommendations = await this.findRidesByPatterns(patterns, context);
      
      return {
        recommendations,
        patterns,
        context
      };
    } catch (error) {
      console.error('MatchingService.getRecommendations error:', error);
      throw error;
    }
  }

  /**
   * Analyze user ride patterns
   */
  analyzeUserPatterns(bookings) {
    const patterns = {
      commonPickups: {},
      commonDestinations: {},
      preferredTimes: {},
      frequentRoutes: {}
    };

    bookings.forEach(booking => {
      // Analyze pickup locations
      const pickup = booking.pickupPoint;
      patterns.commonPickups[pickup] = (patterns.commonPickups[pickup] || 0) + 1;
      
      // Analyze destinations
      const destination = booking.ride?.destination;
      if (destination) {
        patterns.commonDestinations[destination] = (patterns.commonDestinations[destination] || 0) + 1;
      }
      
      // Analyze departure times
      const hour = new Date(booking.ride?.departureTime).getHours();
      patterns.preferredTimes[hour] = (patterns.preferredTimes[hour] || 0) + 1;
      
      // Analyze routes
      const route = `${pickup} → ${destination}`;
      patterns.frequentRoutes[route] = (patterns.frequentRoutes[route] || 0) + 1;
    });

    return patterns;
  }

  /**
   * Find rides matching user patterns
   */
  async findRidesByPatterns(patterns, context) {
    const recommendations = [];
    
    // Get top patterns
    const topPickups = Object.entries(patterns.commonPickups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([location]) => location);
    
    const topDestinations = Object.entries(patterns.commonDestinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([location]) => location);

    // Find rides matching patterns
    for (const pickup of topPickups) {
      for (const destination of topDestinations) {
        const rides = await this.rideRepo.findAvailableRides({
          pickup,
          destination,
          seats: context.seatsRequested || 1
        });
        
        recommendations.push(...rides);
      }
    }

    return recommendations.slice(0, 10);
  }

  /**
   * Extract university name from destination
   */
  extractUniversity(destination) {
    const universities = ['FCC', 'FCCU', 'Forman Christian College'];
    const lowerDest = destination.toLowerCase();
    
    for (const uni of universities) {
      if (lowerDest.includes(uni.toLowerCase())) {
        return uni;
      }
    }
    
    return destination;
  }

  /**
   * Validate rider request
   */
  validateRiderRequest(request) {
    if (!request.pickup) {
      throw new Error('Pickup location is required');
    }
    if (!request.destination) {
      throw new Error('Destination is required');
    }
    if (!request.departureTime) {
      throw new Error('Departure time is required');
    }
    if (!request.seatsRequested || request.seatsRequested < 1) {
      throw new Error('Valid seats requested is required');
    }
  }

  /**
   * Get user ride history
   */
  async getUserRideHistory(userId) {
    // This would typically come from BookingRepository
    // For now, return empty array
    return [];
  }
}

module.exports = MatchingService; 