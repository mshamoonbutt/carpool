import DataService from './DataService';

// Simulating async API behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * BookingService - Handles all booking-related operations
 */
class BookingService {
  /**
   * Get all bookings with optional filters
   * @param {Object} filters Optional filters (riderId, driverId, rideId)
   * @returns {Promise<Array>} The filtered bookings
   */
  static async getBookings(filters = {}) {
    // Simulate API delay
    await delay(200);
    
    return DataService.getAllBookings(filters);
  }
  
  /**
   * Book a ride
   * @param {Object} bookingData The booking data
   * @returns {Promise<Object>} The newly created booking
   */
  static async bookRide(bookingData) {
    try {
      // Simulate API delay
      await delay(300);
      
      return DataService.bookRide(bookingData);
    } catch (error) {
      console.error('Book ride error:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a booking
   * @param {string} bookingId The booking ID
   * @returns {Promise<Object>} Success status and penalty info
   */
  static async cancelBooking(bookingId) {
    try {
      // Simulate API delay
      await delay(200);
      
      return DataService.cancelBooking(bookingId);
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }
  
  /**
   * Get a user's ride history
   * @param {string} userId The user ID
   * @param {string} role 'driver' or 'rider'
   * @returns {Promise<Array>} The user's ride history
   */
  static async getUserRideHistory(userId, role = 'rider') {
    // Simulate API delay
    await delay(200);
    
    // Get relevant bookings
    const filterKey = role === 'driver' ? 'driverId' : 'riderId';
    const bookings = DataService.getAllBookings({ [filterKey]: userId });
    
    // Get ride details for each booking
    const ridePromises = bookings.map(async booking => {
      const ride = DataService.getRideById(booking.rideId);
      
      // Check if ride exists
      if (!ride) return null;
      
      return {
        ...booking,
        ride: {
          id: ride.id,
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          departureTime: ride.departureTime,
          driverId: ride.driverId,
          driverName: ride.driverName
        }
      };
    });
    
    // Filter out null values (rides that don't exist anymore)
    return (await Promise.all(ridePromises)).filter(item => item !== null);
  }
  
  /**
   * Rate a driver or rider after a ride
   * @param {Object} ratingData The rating data
   * @returns {Promise<Object>} The created rating
   */
  static async rateUser(ratingData) {
    try {
      // Simulate API delay
      await delay(200);
      
      return DataService.addRating(ratingData);
    } catch (error) {
      console.error('Rate user error:', error);
      throw error;
    }
  }
}

export default BookingService;
