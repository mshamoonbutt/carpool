/**
 * SafetyService - Safety monitoring and restrictions for UniPool
 * Handles time restrictions, user verification, suspicious activity detection
 */

const UserRepository = require('../repositories/UserRepository');
const RideRepository = require('../repositories/RideRepository');
const BookingRepository = require('../repositories/BookingRepository');
const NotificationService = require('./NotificationService');
const RatingService = require('./RatingService');

class SafetyService {
  constructor() {
    this.userRepo = new UserRepository();
    this.rideRepo = new RideRepository();
    this.bookingRepo = new BookingRepository();
    this.notificationService = new NotificationService();
    this.ratingService = new RatingService();
    
    // Safety configuration
    this.config = {
      operatingHours: {
        start: 6, // 6 AM
        end: 22   // 10 PM
      },
      allowedUniversities: [
        'formanite.fccollege.edu.pk',
        'fccollege.edu.pk'
      ],
      suspiciousActivityThresholds: {
        noShows: 3,
        cancellations: 5,
        lowRatings: 2
      },
      safetyScores: {
        excellent: 4.5,
        good: 4.0,
        fair: 3.0,
        poor: 2.5
      }
    };
  }

  /**
   * Validate ride safety before creation
   */
  async validateRideSafety(rideData) {
    try {
      const validations = [];

      // Check time restrictions
      const timeValidation = this.checkTimeRestriction(rideData.departureTime);
      validations.push(timeValidation);

      // Check driver safety score
      const driverValidation = await this.checkDriverSafety(rideData.driverId);
      validations.push(driverValidation);

      // Check pickup/dropoff safety
      const locationValidation = await this.checkLocationSafety(rideData.pickup, rideData.destination);
      validations.push(locationValidation);

      // Check for suspicious patterns
      const patternValidation = await this.checkSuspiciousPatterns(rideData.driverId);
      validations.push(patternValidation);

      // Determine overall safety status
      const failedValidations = validations.filter(v => !v.safe);
      const isSafe = failedValidations.length === 0;

      return {
        isSafe,
        validations,
        warnings: failedValidations.map(v => v.warning),
        recommendations: this.generateSafetyRecommendations(validations)
      };
    } catch (error) {
      console.error('SafetyService.validateRideSafety error:', error);
      throw error;
    }
  }

  /**
   * Check time restriction for ride
   */
  checkTimeRestriction(departureTime) {
    const departureHour = new Date(departureTime).getHours();
    const isWithinHours = departureHour >= this.config.operatingHours.start && 
                         departureHour <= this.config.operatingHours.end;

    return {
      type: 'time_restriction',
      safe: isWithinHours,
      warning: isWithinHours ? null : 
        `Rides are only allowed between ${this.config.operatingHours.start}:00 AM and ${this.config.operatingHours.end}:00 PM`,
      details: {
        departureHour,
        allowedStart: this.config.operatingHours.start,
        allowedEnd: this.config.operatingHours.end
      }
    };
  }

  /**
   * Check driver safety score and history
   */
  async checkDriverSafety(driverId) {
    try {
      const driver = await this.userRepo.findById(driverId);
      if (!driver) {
        return {
          type: 'driver_safety',
          safe: false,
          warning: 'Driver not found',
          details: { driverId }
        };
      }

      // Check university email verification
      const emailValid = this.verifyUniversityEmail(driver.email);
      if (!emailValid) {
        return {
          type: 'driver_safety',
          safe: false,
          warning: 'Driver must use verified university email',
          details: { email: driver.email }
        };
      }

      // Check driver rating
      const driverRating = driver.driverRating || 0;
      const ratingSafe = driverRating >= this.config.safetyScores.fair;

      // Check driver history
      const history = await this.getDriverHistory(driverId);
      const historySafe = this.assessDriverHistory(history);

      const isSafe = emailValid && ratingSafe && historySafe;

      return {
        type: 'driver_safety',
        safe: isSafe,
        warning: isSafe ? null : 'Driver safety concerns detected',
        details: {
          emailVerified: emailValid,
          rating: driverRating,
          ratingSafe,
          historySafe,
          totalRides: history.totalRides,
          noShows: history.noShows,
          cancellations: history.cancellations
        }
      };
    } catch (error) {
      console.error('SafetyService.checkDriverSafety error:', error);
      return {
        type: 'driver_safety',
        safe: false,
        warning: 'Unable to verify driver safety',
        details: { error: error.message }
      };
    }
  }

  /**
   * Check location safety
   */
  async checkLocationSafety(pickup, destination) {
    try {
      // Check if locations are within reasonable distance
      const distance = await this.calculateDistance(pickup, destination);
      const isReasonableDistance = distance <= 50; // 50km max

      // Check for suspicious pickup/dropoff patterns
      const pickupSafe = this.isSafeLocation(pickup);
      const destinationSafe = this.isSafeLocation(destination);

      const isSafe = isReasonableDistance && pickupSafe && destinationSafe;

      return {
        type: 'location_safety',
        safe: isSafe,
        warning: isSafe ? null : 'Location safety concerns detected',
        details: {
          distance,
          isReasonableDistance,
          pickupSafe,
          destinationSafe
        }
      };
    } catch (error) {
      console.error('SafetyService.checkLocationSafety error:', error);
      return {
        type: 'location_safety',
        safe: false,
        warning: 'Unable to verify location safety',
        details: { error: error.message }
      };
    }
  }

  /**
   * Check for suspicious patterns
   */
  async checkSuspiciousPatterns(userId) {
    try {
      const patterns = await this.detectSuspiciousActivity(userId);
      const hasSuspiciousPatterns = patterns.length > 0;

      return {
        type: 'suspicious_patterns',
        safe: !hasSuspiciousPatterns,
        warning: hasSuspiciousPatterns ? 'Suspicious activity patterns detected' : null,
        details: {
          patterns,
          patternCount: patterns.length
        }
      };
    } catch (error) {
      console.error('SafetyService.checkSuspiciousPatterns error:', error);
      return {
        type: 'suspicious_patterns',
        safe: false,
        warning: 'Unable to check for suspicious patterns',
        details: { error: error.message }
      };
    }
  }

  /**
   * Verify university email
   */
  verifyUniversityEmail(email) {
    return this.config.allowedUniversities.some(domain => 
      email.toLowerCase().endsWith(domain.toLowerCase())
    );
  }

  /**
   * Get driver history
   */
  async getDriverHistory(driverId) {
    try {
      const rides = await this.rideRepo.findByDriverId(driverId);
      const bookings = await this.bookingRepo.findByDriverId(driverId);

      const history = {
        totalRides: rides.length,
        completedRides: rides.filter(r => r.status === 'completed').length,
        cancelledRides: rides.filter(r => r.status === 'cancelled').length,
        totalBookings: bookings.length,
        noShows: await this.countNoShows(driverId),
        cancellations: await this.countCancellations(driverId),
        averageRating: await this.getAverageRating(driverId, 'driver')
      };

      return history;
    } catch (error) {
      console.error('SafetyService.getDriverHistory error:', error);
      return {
        totalRides: 0,
        completedRides: 0,
        cancelledRides: 0,
        totalBookings: 0,
        noShows: 0,
        cancellations: 0,
        averageRating: 0
      };
    }
  }

  /**
   * Assess driver history for safety
   */
  assessDriverHistory(history) {
    const noShowRate = history.totalRides > 0 ? history.noShows / history.totalRides : 0;
    const cancellationRate = history.totalRides > 0 ? history.cancelledRides / history.totalRides : 0;

    return noShowRate <= 0.1 && // Less than 10% no-shows
           cancellationRate <= 0.2 && // Less than 20% cancellations
           history.averageRating >= this.config.safetyScores.fair;
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(userId) {
    const patterns = [];

    try {
      // Check for excessive no-shows
      const noShows = await this.countNoShows(userId);
      if (noShows >= this.config.suspiciousActivityThresholds.noShows) {
        patterns.push({
          type: 'excessive_no_shows',
          count: noShows,
          threshold: this.config.suspiciousActivityThresholds.noShows
        });
      }

      // Check for excessive cancellations
      const cancellations = await this.countCancellations(userId);
      if (cancellations >= this.config.suspiciousActivityThresholds.cancellations) {
        patterns.push({
          type: 'excessive_cancellations',
          count: cancellations,
          threshold: this.config.suspiciousActivityThresholds.cancellations
        });
      }

      // Check for consistently low ratings
      const averageRating = await this.getAverageRating(userId);
      if (averageRating <= this.config.suspiciousActivityThresholds.lowRatings) {
        patterns.push({
          type: 'low_ratings',
          averageRating,
          threshold: this.config.suspiciousActivityThresholds.lowRatings
        });
      }

      // Check for unusual booking patterns
      const bookingPatterns = await this.detectUnusualBookingPatterns(userId);
      patterns.push(...bookingPatterns);

    } catch (error) {
      console.error('SafetyService.detectSuspiciousActivity error:', error);
    }

    return patterns;
  }

  /**
   * Record no-show incident
   */
  async recordNoShow(bookingId, userId, roleType) {
    try {
      const noShowRecord = {
        id: uuidv4(),
        bookingId,
        userId,
        roleType,
        timestamp: new Date(),
        type: 'no_show'
      };

      // Save no-show record
      await this.saveSafetyIncident(noShowRecord);

      // Check if this triggers safety measures
      const noShows = await this.countNoShows(userId);
      if (noShows >= this.config.suspiciousActivityThresholds.noShows) {
        await this.handleExcessiveNoShows(userId, noShows);
      }

      // Apply automatic rating penalty
      await this.ratingService.applyAutomaticRating(userId, 1, roleType, 'No-show');

      return noShowRecord;
    } catch (error) {
      console.error('SafetyService.recordNoShow error:', error);
      throw error;
    }
  }

  /**
   * Handle excessive no-shows
   */
  async handleExcessiveNoShows(userId, noShowCount) {
    try {
      const user = await this.userRepo.findById(userId);
      
      // Send warning notification
      await this.notificationService.sendNotification(userId, {
        type: 'excessive_no_shows_warning',
        title: 'No-Show Warning',
        message: `You have ${noShowCount} no-show incidents. Further no-shows may result in account suspension.`,
        priority: 'high',
        data: { noShowCount }
      });

      // Flag user if necessary
      if (noShowCount >= 5) {
        await this.flagUserForSafety(userId, 'excessive_no_shows', { noShowCount });
      }
    } catch (error) {
      console.error('SafetyService.handleExcessiveNoShows error:', error);
    }
  }

  /**
   * Flag user for safety concerns
   */
  async flagUserForSafety(userId, reason, details) {
    try {
      await this.userRepo.update(userId, {
        status: 'safety_flagged',
        flagReason: reason,
        flagData: {
          ...details,
          flaggedAt: new Date()
        }
      });

      // Send critical notification
      await this.notificationService.sendNotification(userId, {
        type: 'safety_flag',
        title: 'Account Flagged for Safety',
        message: 'Your account has been flagged due to safety concerns. Please contact support.',
        priority: 'critical',
        data: { reason, details }
      });

      return { flagged: true, reason };
    } catch (error) {
      console.error('SafetyService.flagUserForSafety error:', error);
      throw error;
    }
  }

  /**
   * Generate safety recommendations
   */
  generateSafetyRecommendations(validations) {
    const recommendations = [];

    validations.forEach(validation => {
      if (!validation.safe) {
        switch (validation.type) {
          case 'time_restriction':
            recommendations.push('Schedule rides during operating hours (6 AM - 10 PM)');
            break;
          case 'driver_safety':
            recommendations.push('Ensure driver has verified university email and good rating');
            break;
          case 'location_safety':
            recommendations.push('Choose safe pickup and dropoff locations');
            break;
          case 'suspicious_patterns':
            recommendations.push('Review account activity and address any concerns');
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Calculate distance between locations
   */
  async calculateDistance(location1, location2) {
    // This would integrate with MapService
    // For now, return mock distance
    return 25; // 25km
  }

  /**
   * Check if location is safe
   */
  isSafeLocation(location) {
    // This would check against a database of safe/unsafe locations
    // For now, return true for most locations
    const unsafeKeywords = ['abandoned', 'industrial', 'warehouse'];
    return !unsafeKeywords.some(keyword => 
      location.toLowerCase().includes(keyword)
    );
  }

  /**
   * Count no-shows for user
   */
  async countNoShows(userId) {
    // This would query the safety incidents table
    // For now, return mock data
    return 0;
  }

  /**
   * Count cancellations for user
   */
  async countCancellations(userId) {
    // This would query the bookings table
    // For now, return mock data
    return 0;
  }

  /**
   * Get average rating for user
   */
  async getAverageRating(userId, roleType = null) {
    // This would query the ratings table
    // For now, return mock data
    return 4.5;
  }

  /**
   * Detect unusual booking patterns
   */
  async detectUnusualBookingPatterns(userId) {
    // This would analyze booking history for patterns
    // For now, return empty array
    return [];
  }

  /**
   * Save safety incident
   */
  async saveSafetyIncident(incident) {
    // This would save to a safety incidents table
    // For now, just log
    console.log('Safety incident recorded:', incident);
  }
}

module.exports = SafetyService; 