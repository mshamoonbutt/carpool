/**
 * BookingService - Comprehensive booking management for UniPool
 * Handles ride bookings, cancellations, seat management, and policies
 */

const { v4: uuidv4 } = require('uuid');
const BookingRepository = require('../repositories/BookingRepository');
const RideRepository = require('../repositories/RideRepository');
const UserRepository = require('../repositories/UserRepository');
const NotificationService = require('./NotificationService');
const RatingService = require('./RatingService');

class BookingService {
  constructor() {
    this.bookingRepo = new BookingRepository();
    this.rideRepo = new RideRepository();
    this.userRepo = new UserRepository();
    this.notificationService = new NotificationService();
    this.ratingService = new RatingService();
  }

  /**
   * Create a new booking for a ride
   */
  async bookRide(rideId, bookingData) {
    try {
      // Validate booking data
      this.validateBookingData(bookingData);

      // Get ride details
      const ride = await this.rideRepo.findById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      if (ride.status !== 'active') {
        throw new Error('Ride is not available for booking');
      }

      // Check seat availability
      const availableSeats = await this.checkSeatAvailability(rideId, bookingData.seatsRequested);
      if (!availableSeats.available) {
        throw new Error(`Only ${availableSeats.remainingSeats} seats available`);
      }

      // Check if user already has a booking for this ride
      const existingBooking = await this.bookingRepo.findByRideAndRider(rideId, bookingData.riderId);
      if (existingBooking && existingBooking.status !== 'cancelled') {
        throw new Error('You already have a booking for this ride');
      }

      // Create booking
      const booking = {
        id: uuidv4(),
        rideId,
        riderId: bookingData.riderId,
        pickupPoint: bookingData.pickupPoint,
        seatsRequested: bookingData.seatsRequested,
        status: 'confirmed',
        bookingCode: this.generateBookingCode(),
        totalAmount: this.calculateBookingAmount(ride, bookingData.seatsRequested),
        bookingTime: new Date(),
        specialRequests: bookingData.specialRequests || null
      };

      // Save booking
      const savedBooking = await this.bookingRepo.create(booking);

      // Update ride seat count
      await this.rideRepo.updateAvailableSeats(rideId, -bookingData.seatsRequested);

      // Send notifications
      await this.notificationService.notifyBookingConfirmation(savedBooking);
      await this.notificationService.notifyDriverOfBooking(savedBooking);

      return savedBooking;
    } catch (error) {
      console.error('BookingService.bookRide error:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking with policy enforcement
   */
  async cancelBooking(bookingId, reason, userId) {
    try {
      const booking = await this.bookingRepo.findById(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if user can cancel this booking
      if (booking.riderId !== userId) {
        throw new Error('Unauthorized to cancel this booking');
      }

      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      if (booking.status === 'completed') {
        throw new Error('Cannot cancel completed booking');
      }

      // Get ride details for time calculation
      const ride = await this.rideRepo.findById(booking.rideId);
      const timeUntilDeparture = new Date(ride.departureTime) - new Date();
      const hoursUntilDeparture = timeUntilDeparture / (1000 * 60 * 60);

      // Apply cancellation policy
      const cancellationResult = await this.applyCancellationPolicy(booking, hoursUntilDeparture, reason);

      // Update booking status
      await this.bookingRepo.update(bookingId, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        refundAmount: cancellationResult.refundAmount,
        penaltyApplied: cancellationResult.penaltyApplied
      });

      // Update ride seat count
      await this.rideRepo.updateAvailableSeats(booking.rideId, booking.seatsRequested);

      // Send notifications
      await this.notificationService.notifyBookingCancellation(booking, cancellationResult);

      return {
        ...booking,
        status: 'cancelled',
        cancellationResult
      };
    } catch (error) {
      console.error('BookingService.cancelBooking error:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId, filters = {}) {
    try {
      const bookings = await this.bookingRepo.findByUserId(userId, filters);
      
      // Populate ride and user details
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const ride = await this.rideRepo.findById(booking.rideId);
          const rider = await this.userRepo.findById(booking.riderId);
          const driver = await this.userRepo.findById(ride.driverId);
          
          return {
            ...booking,
            ride: {
              id: ride.id,
              pickup: ride.pickup,
              destination: ride.destination,
              departureTime: ride.departureTime,
              driverName: driver.name,
              driverRating: driver.rating
            },
            rider: {
              id: rider.id,
              name: rider.name,
              rating: rider.rating
            }
          };
        })
      );

      return enrichedBookings;
    } catch (error) {
      console.error('BookingService.getUserBookings error:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for a ride (driver's view)
   */
  async getRideBookings(rideId, userId) {
    try {
      const ride = await this.rideRepo.findById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      // Check if user is the driver
      if (ride.driverId !== userId) {
        throw new Error('Unauthorized to view ride bookings');
      }

      const bookings = await this.bookingRepo.findByRideId(rideId);
      
      // Populate rider details
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const rider = await this.userRepo.findById(booking.riderId);
          return {
            ...booking,
            rider: {
              id: rider.id,
              name: rider.name,
              rating: rider.rating,
              phone: rider.phone
            }
          };
        })
      );

      return enrichedBookings;
    } catch (error) {
      console.error('BookingService.getRideBookings error:', error);
      throw error;
    }
  }

  /**
   * Check seat availability for a ride
   */
  async checkSeatAvailability(rideId, seatsRequested) {
    try {
      const ride = await this.rideRepo.findById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      const confirmedBookings = await this.bookingRepo.getConfirmedBookingsForRide(rideId);
      const totalBookedSeats = confirmedBookings.reduce((sum, booking) => sum + booking.seatsRequested, 0);
      const remainingSeats = ride.seats - totalBookedSeats;

      return {
        available: remainingSeats >= seatsRequested,
        remainingSeats,
        totalSeats: ride.seats,
        bookedSeats: totalBookedSeats
      };
    } catch (error) {
      console.error('BookingService.checkSeatAvailability error:', error);
      throw error;
    }
  }

  /**
   * Apply cancellation policy and calculate penalties
   */
  async applyCancellationPolicy(booking, hoursUntilDeparture, reason) {
    let penaltyApplied = 0;
    let refundAmount = booking.totalAmount;

    if (hoursUntilDeparture < 1) {
      // Less than 1 hour - 2-star penalty
      penaltyApplied = booking.totalAmount * 0.5; // 50% penalty
      refundAmount = booking.totalAmount * 0.5;
      
      // Apply automatic rating penalty
      await this.ratingService.applyAutomaticRating(booking.riderId, 2, 'rider', 'Late cancellation');
    } else if (hoursUntilDeparture < 24) {
      // Less than 24 hours - 1-star penalty
      penaltyApplied = booking.totalAmount * 0.2; // 20% penalty
      refundAmount = booking.totalAmount * 0.8;
      
      // Apply automatic rating penalty
      await this.ratingService.applyAutomaticRating(booking.riderId, 1, 'rider', 'Short notice cancellation');
    }

    return {
      penaltyApplied,
      refundAmount,
      hoursUntilDeparture,
      reason
    };
  }

  /**
   * Generate unique booking code
   */
  generateBookingCode() {
    return 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
  }

  /**
   * Calculate booking amount
   */
  calculateBookingAmount(ride, seatsRequested) {
    return ride.price * seatsRequested;
  }

  /**
   * Validate booking data
   */
  validateBookingData(bookingData) {
    if (!bookingData.riderId) {
      throw new Error('Rider ID is required');
    }
    if (!bookingData.pickupPoint) {
      throw new Error('Pickup point is required');
    }
    if (!bookingData.seatsRequested || bookingData.seatsRequested < 1 || bookingData.seatsRequested > 4) {
      throw new Error('Seats requested must be between 1 and 4');
    }
  }

  /**
   * Get booking statistics for a user
   */
  async getUserBookingStats(userId) {
    try {
      const bookings = await this.bookingRepo.findByUserId(userId);
      
      const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        totalSpent: bookings
          .filter(b => b.status === 'confirmed' || b.status === 'completed')
          .reduce((sum, b) => sum + b.totalAmount, 0),
        totalRefunded: bookings
          .filter(b => b.status === 'cancelled')
          .reduce((sum, b) => sum + (b.refundAmount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('BookingService.getUserBookingStats error:', error);
      throw error;
    }
  }
}

module.exports = BookingService; 