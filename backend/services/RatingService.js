/**
 * RatingService - 5-star rating system for UniPool
 * Handles ratings, reviews, analytics, and rating policies
 */

const { v4: uuidv4 } = require('uuid');
const RatingRepository = require('../repositories/RatingRepository');
const UserRepository = require('../repositories/UserRepository');
const RideRepository = require('../repositories/RideRepository');
const NotificationService = require('./NotificationService');

class RatingService {
  constructor() {
    this.ratingRepo = new RatingRepository();
    this.userRepo = new UserRepository();
    this.rideRepo = new RideRepository();
    this.notificationService = new NotificationService();
    
    // Rating configuration
    this.config = {
      minRidesForRating: 3,
      maxReviewLength: 200,
      lowRatingThreshold: 2.5,
      criticalRatingThreshold: 2.0,
      minRidesForCriticalFlag: 10
    };
  }

  /**
   * Add a new rating
   */
  async addRating(ratingData) {
    try {
      // Validate rating data
      this.validateRatingData(ratingData);

      // Check if rating already exists
      const existingRating = await this.ratingRepo.findByRideAndRater(
        ratingData.rideId,
        ratingData.raterUserId,
        ratingData.roleType
      );

      if (existingRating) {
        throw new Error('You have already rated this ride');
      }

      // Verify ride exists and user participated
      const ride = await this.rideRepo.findById(ratingData.rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      // Verify user participated in the ride
      await this.verifyUserParticipation(ratingData.rideId, ratingData.raterUserId, ratingData.roleType);

      // Create rating record
      const rating = {
        id: uuidv4(),
        rideId: ratingData.rideId,
        ratedUserId: ratingData.ratedUserId,
        raterUserId: ratingData.raterUserId,
        roleType: ratingData.roleType, // 'driver' or 'rider'
        rating: ratingData.rating,
        review: ratingData.review || null,
        timestamp: new Date()
      };

      // Save rating
      const savedRating = await this.ratingRepo.create(rating);

      // Update user's average rating
      await this.updateUserRating(ratingData.ratedUserId, ratingData.roleType);

      // Handle low ratings
      if (ratingData.rating <= this.config.lowRatingThreshold) {
        await this.handleLowRating(ratingData.ratedUserId, ratingData.rating, ratingData.roleType);
      }

      // Send notification to rated user
      await this.notifyRatingReceived(ratingData.ratedUserId, savedRating);

      return savedRating;
    } catch (error) {
      console.error('RatingService.addRating error:', error);
      throw error;
    }
  }

  /**
   * Get user's rating statistics
   */
  async getUserRatingStats(userId, roleType = null) {
    try {
      const ratings = await this.ratingRepo.findByUserId(userId, roleType);
      
      if (ratings.length === 0) {
        return {
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          totalRides: 0,
          ratingPercentage: 0
        };
      }

      // Calculate statistics
      const totalRatings = ratings.length;
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
      
      // Rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(r => distribution[r.rating]++);

      // Get total rides for percentage calculation
      const totalRides = await this.getUserTotalRides(userId, roleType);
      const ratingPercentage = totalRides > 0 ? (totalRatings / totalRides) * 100 : 0;

      return {
        totalRatings,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution: distribution,
        totalRides,
        ratingPercentage: Math.round(ratingPercentage * 100) / 100
      };
    } catch (error) {
      console.error('RatingService.getUserRatingStats error:', error);
      throw error;
    }
  }

  /**
   * Get ratings for a specific ride
   */
  async getRideRatings(rideId) {
    try {
      const ratings = await this.ratingRepo.findByRideId(rideId);
      
      // Enrich with user details
      const enrichedRatings = await Promise.all(
        ratings.map(async (rating) => {
          const rater = await this.userRepo.findById(rating.raterUserId);
          const rated = await this.userRepo.findById(rating.ratedUserId);
          
          return {
            ...rating,
            rater: {
              id: rater.id,
              name: rater.name,
              profile: rater.profile
            },
            rated: {
              id: rated.id,
              name: rated.name,
              profile: rated.profile
            }
          };
        })
      );

      return enrichedRatings;
    } catch (error) {
      console.error('RatingService.getRideRatings error:', error);
      throw error;
    }
  }

  /**
   * Get user's recent ratings
   */
  async getUserRecentRatings(userId, limit = 10) {
    try {
      const ratings = await this.ratingRepo.findRecentByUserId(userId, limit);
      
      // Enrich with ride details
      const enrichedRatings = await Promise.all(
        ratings.map(async (rating) => {
          const ride = await this.rideRepo.findById(rating.rideId);
          const rater = await this.userRepo.findById(rating.raterUserId);
          
          return {
            ...rating,
            ride: {
              id: ride.id,
              pickup: ride.pickup,
              destination: ride.destination,
              departureTime: ride.departureTime
            },
            rater: {
              id: rater.id,
              name: rater.name
            }
          };
        })
      );

      return enrichedRatings;
    } catch (error) {
      console.error('RatingService.getUserRecentRatings error:', error);
      throw error;
    }
  }

  /**
   * Handle low rating automatically
   */
  async handleLowRating(userId, rating, roleType) {
    try {
      const user = await this.userRepo.findById(userId);
      const stats = await this.getUserRatingStats(userId, roleType);

      // Send warning notification
      await this.notificationService.sendNotification(userId, {
        type: 'low_rating_warning',
        title: 'Rating Alert',
        message: `Your recent rating of ${rating} stars is below our standards. Please review our community guidelines.`,
        priority: 'high',
        data: { rating, roleType, averageRating: stats.averageRating }
      });

      // Check if user should be flagged
      if (stats.averageRating <= this.config.criticalRatingThreshold && 
          stats.totalRides >= this.config.minRidesForCriticalFlag) {
        await this.flagUserForLowRating(userId, stats);
      }

      return { warningSent: true, flagged: stats.averageRating <= this.config.criticalRatingThreshold };
    } catch (error) {
      console.error('RatingService.handleLowRating error:', error);
      throw error;
    }
  }

  /**
   * Flag user for critically low rating
   */
  async flagUserForLowRating(userId, stats) {
    try {
      // Update user status
      await this.userRepo.update(userId, {
        status: 'flagged',
        flagReason: 'Low rating',
        flagData: {
          averageRating: stats.averageRating,
          totalRides: stats.totalRides,
          flaggedAt: new Date()
        }
      });

      // Send critical notification
      await this.notificationService.sendNotification(userId, {
        type: 'critical_rating_alert',
        title: 'Account Flagged',
        message: 'Your account has been flagged due to consistently low ratings. Please contact support.',
        priority: 'critical',
        data: { averageRating: stats.averageRating }
      });

      return { flagged: true };
    } catch (error) {
      console.error('RatingService.flagUserForLowRating error:', error);
      throw error;
    }
  }

  /**
   * Apply automatic rating for policy violations
   */
  async applyAutomaticRating(userId, rating, roleType, reason) {
    try {
      // Create automatic rating record
      const automaticRating = {
        id: uuidv4(),
        rideId: null, // No specific ride
        ratedUserId: userId,
        raterUserId: 'system', // System-generated rating
        roleType,
        rating,
        review: `Automatic rating: ${reason}`,
        timestamp: new Date(),
        isAutomatic: true
      };

      // Save rating
      await this.ratingRepo.create(automaticRating);

      // Update user's average rating
      await this.updateUserRating(userId, roleType);

      // Handle if this creates a low rating situation
      if (rating <= this.config.lowRatingThreshold) {
        await this.handleLowRating(userId, rating, roleType);
      }

      return automaticRating;
    } catch (error) {
      console.error('RatingService.applyAutomaticRating error:', error);
      throw error;
    }
  }

  /**
   * Get rating trends for a user
   */
  async getRatingTrends(userId, roleType = null, period = '30d') {
    try {
      const ratings = await this.ratingRepo.findByUserIdAndPeriod(userId, roleType, period);
      
      if (ratings.length === 0) {
        return { trends: [], averageTrend: 0 };
      }

      // Group by week and calculate averages
      const weeklyAverages = this.calculateWeeklyAverages(ratings);
      
      // Calculate trend
      const trend = this.calculateTrend(weeklyAverages);

      return {
        trends: weeklyAverages,
        averageTrend: trend,
        period
      };
    } catch (error) {
      console.error('RatingService.getRatingTrends error:', error);
      throw error;
    }
  }

  /**
   * Compare user ratings
   */
  async compareUserRatings(userId1, userId2, roleType = null) {
    try {
      const [stats1, stats2] = await Promise.all([
        this.getUserRatingStats(userId1, roleType),
        this.getUserRatingStats(userId2, roleType)
      ]);

      return {
        user1: { id: userId1, stats: stats1 },
        user2: { id: userId2, stats: stats2 },
        comparison: {
          ratingDifference: Math.abs(stats1.averageRating - stats2.averageRating),
          totalRatingsDifference: Math.abs(stats1.totalRatings - stats2.totalRatings),
          betterRated: stats1.averageRating > stats2.averageRating ? userId1 : userId2
        }
      };
    } catch (error) {
      console.error('RatingService.compareUserRatings error:', error);
      throw error;
    }
  }

  /**
   * Update user's average rating
   */
  async updateUserRating(userId, roleType) {
    try {
      const stats = await this.getUserRatingStats(userId, roleType);
      
      // Update user record
      const updateData = {};
      if (roleType === 'driver') {
        updateData.driverRating = stats.averageRating;
        updateData.driverTotalRides = stats.totalRides;
      } else if (roleType === 'rider') {
        updateData.riderRating = stats.averageRating;
        updateData.riderTotalRides = stats.totalRides;
      }

      await this.userRepo.update(userId, updateData);
    } catch (error) {
      console.error('RatingService.updateUserRating error:', error);
      throw error;
    }
  }

  /**
   * Verify user participated in the ride
   */
  async verifyUserParticipation(rideId, userId, roleType) {
    try {
      if (roleType === 'driver') {
        const ride = await this.rideRepo.findById(rideId);
        if (ride.driverId !== userId) {
          throw new Error('You were not the driver for this ride');
        }
      } else if (roleType === 'rider') {
        // Check if user has a booking for this ride
        const booking = await this.getBookingForRide(rideId, userId);
        if (!booking) {
          throw new Error('You were not a rider for this ride');
        }
      }
    } catch (error) {
      console.error('RatingService.verifyUserParticipation error:', error);
      throw error;
    }
  }

  /**
   * Notify user of received rating
   */
  async notifyRatingReceived(userId, rating) {
    try {
      const rater = await this.userRepo.findById(rating.raterUserId);
      
      await this.notificationService.sendNotification(userId, {
        type: 'rating_received',
        title: 'New Rating Received',
        message: `${rater.name} gave you ${rating.rating} stars${rating.review ? ' with a review' : ''}.`,
        priority: 'medium',
        data: { 
          ratingId: rating.id,
          rating: rating.rating,
          hasReview: !!rating.review
        }
      });
    } catch (error) {
      console.error('RatingService.notifyRatingReceived error:', error);
      // Don't throw error for notification failures
    }
  }

  /**
   * Validate rating data
   */
  validateRatingData(ratingData) {
    if (!ratingData.rideId) {
      throw new Error('Ride ID is required');
    }
    if (!ratingData.ratedUserId) {
      throw new Error('Rated user ID is required');
    }
    if (!ratingData.raterUserId) {
      throw new Error('Rater user ID is required');
    }
    if (!ratingData.roleType || !['driver', 'rider'].includes(ratingData.roleType)) {
      throw new Error('Valid role type is required');
    }
    if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (ratingData.review && ratingData.review.length > this.config.maxReviewLength) {
      throw new Error(`Review must be ${this.config.maxReviewLength} characters or less`);
    }
  }

  /**
   * Calculate weekly averages from ratings
   */
  calculateWeeklyAverages(ratings) {
    const weeklyData = {};
    
    ratings.forEach(rating => {
      const week = this.getWeekOfYear(rating.timestamp);
      if (!weeklyData[week]) {
        weeklyData[week] = { total: 0, count: 0 };
      }
      weeklyData[week].total += rating.rating;
      weeklyData[week].count += 1;
    });

    return Object.keys(weeklyData).map(week => ({
      week,
      average: weeklyData[week].total / weeklyData[week].count
    }));
  }

  /**
   * Calculate trend from weekly averages
   */
  calculateTrend(weeklyAverages) {
    if (weeklyAverages.length < 2) return 0;
    
    const first = weeklyAverages[0].average;
    const last = weeklyAverages[weeklyAverages.length - 1].average;
    
    return last - first;
  }

  /**
   * Get week of year from date
   */
  getWeekOfYear(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Get user's total rides
   */
  async getUserTotalRides(userId, roleType) {
    // This would come from RideRepository or BookingRepository
    // For now, return mock data
    return 10;
  }

  /**
   * Get booking for ride
   */
  async getBookingForRide(rideId, userId) {
    // This would come from BookingRepository
    // For now, return mock data
    return { id: 'mock-booking-id' };
  }
}

module.exports = RatingService; 