import DataService from './DataService';

// Simulating async API behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * RideService - Handles all ride-related operations
 */
class RideService {
  /**
   * Get all rides with optional filters
   * @param {Object} filters Optional filters (pickup, dropoff, departureTime)
   * @returns {Promise<Array>} The filtered rides
   */
  static async getRides(filters = {}) {
    // Simulate API delay
    await delay(200);
    
    return DataService.getAllRides(filters);
  }
  
  /**
   * Get a ride by ID
   * @param {string} rideId The ride ID
   * @returns {Promise<Object>} The ride object
   */
  static async getRideById(rideId) {
    // Simulate API delay
    await delay(100);
    
    const ride = DataService.getRideById(rideId);
    
    if (!ride) {
      throw new Error('Ride not found');
    }
    
    return ride;
  }
  
  /**
   * Create a new ride
   * @param {Object} rideData The ride data
   * @returns {Promise<Object>} The newly created ride
   */
  static async createRide(rideData) {
    try {
      // Simulate API delay
      await delay(300);
      
      // Validate departure time (must be in the future)
      const departureTime = new Date(rideData.departureTime);
      const now = new Date();
      
      if (departureTime < now) {
        throw new Error('Departure time must be in the future');
      }
      
      // Create ride
      const newRide = DataService.addRide(rideData);
      
      // If ride is recurring, create additional rides
      if (rideData.recurring && rideData.recurring.enabled) {
        await this.createRecurringRides(newRide, rideData.recurring.days);
      }
      
      return newRide;
    } catch (error) {
      console.error('Create ride error:', error);
      throw error;
    }
  }
  
  /**
   * Create recurring rides based on a template ride
   * @param {Object} templateRide The template ride
   * @param {Array} days Days of the week to create rides for
   * @returns {Promise<void>}
   */
  static async createRecurringRides(templateRide, days) {
    const daysMap = {
      'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0
    };
    
    const departureTime = new Date(templateRide.departureTime);
    const currentDay = departureTime.getDay(); // 0-6, Sunday-Saturday
    
    // Create rides for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(departureTime);
      nextDate.setDate(nextDate.getDate() + i);
      
      const dayName = Object.keys(daysMap).find(key => daysMap[key] === nextDate.getDay());
      
      // Skip if this day isn't in the recurring days
      if (!days.includes(dayName)) continue;
      
      // Create a new ride for this date
      const newRideData = {
        ...templateRide,
        departureTime: nextDate.toISOString(),
        recurring: { ...templateRide.recurring },
        id: undefined // Let DataService generate a new ID
      };
      
      // Remove the daily recurring property for the generated rides
      delete newRideData.recurring;
      
      try {
        await delay(50); // Small delay to prevent DB conflicts
        DataService.addRide(newRideData);
      } catch (error) {
        console.error('Error creating recurring ride:', error);
      }
    }
  }
  
  /**
   * Update an existing ride
   * @param {string} rideId The ride ID
   * @param {Object} updates The updates to apply
   * @returns {Promise<Object>} The updated ride
   */
  static async updateRide(rideId, updates) {
    try {
      // Simulate API delay
      await delay(200);
      
      return DataService.updateRide(rideId, updates);
    } catch (error) {
      console.error('Update ride error:', error);
      throw error;
    }
  }
  
  /**
   * Delete/cancel a ride
   * @param {string} rideId The ride ID
   * @returns {Promise<Object>} Success status
   */
  static async cancelRide(rideId) {
    try {
      // Simulate API delay
      await delay(200);
      
      // Get ride and check if it has bookings
      const ride = DataService.getRideById(rideId);
      
      if (ride && ride.bookings && ride.bookings.length > 0) {
        // In a real app, would send notifications to riders here
        console.log(`Notifying ${ride.bookings.length} riders about cancellation`);
      }
      
      return DataService.deleteRide(rideId);
    } catch (error) {
      console.error('Cancel ride error:', error);
      throw error;
    }
  }
  
  /**
   * Search for rides based on criteria
   * @param {Object} criteria Search criteria
   * @returns {Promise<Array>} Matching rides
   */
  static async searchRides(criteria) {
    // Simulate API delay
    await delay(300);
    
    // Get rides that match basic criteria
    let rides = DataService.getAllRides({
      pickup: criteria.pickup,
      dropoff: criteria.dropoff,
      departureTime: criteria.departureTime
    });
    
    // Apply safety filter for ride times
    const safeHours = { start: 6, end: 22 }; // 6 AM to 10 PM
    rides = rides.filter(ride => {
      const departureHour = new Date(ride.departureTime).getHours();
      return departureHour >= safeHours.start && departureHour < safeHours.end;
    });
    
    // Sort by various factors
    return this.rankRides(rides, criteria);
  }
  
  /**
   * Rank rides based on various factors
   * @param {Array} rides Rides to rank
   * @param {Object} criteria Search criteria
   * @returns {Array} Ranked rides
   */
  static rankRides(rides, criteria) {
    // Get all users for rating information
    const users = DataService.getAllUsers();
    
    return rides.sort((a, b) => {
      // Factor 1: Driver rating (higher is better)
      const driverA = users.find(u => u.id === a.driverId);
      const driverB = users.find(u => u.id === b.driverId);
      
      const ratingA = driverA?.ratings?.driver?.count >= 3 
        ? driverA.ratings.driver.total / driverA.ratings.driver.count 
        : 3; // Default rating if not enough ratings
        
      const ratingB = driverB?.ratings?.driver?.count >= 3 
        ? driverB.ratings.driver.total / driverB.ratings.driver.count 
        : 3;
        
      if (ratingA > 4 && ratingB < 4) return -1;
      if (ratingB > 4 && ratingA < 4) return 1;
      
      // Factor 2: Exact pickup location match
      const exactPickupMatchA = a.pickup.toLowerCase() === criteria.pickup.toLowerCase();
      const exactPickupMatchB = b.pickup.toLowerCase() === criteria.pickup.toLowerCase();
      
      if (exactPickupMatchA && !exactPickupMatchB) return -1;
      if (exactPickupMatchB && !exactPickupMatchA) return 1;
      
      // Factor 3: Route passes through pickup
      const routePassesA = a.route?.some(point => 
        point.toLowerCase().includes(criteria.pickup.toLowerCase())
      );
      const routePassesB = b.route?.some(point => 
        point.toLowerCase().includes(criteria.pickup.toLowerCase())
      );
      
      if (routePassesA && !routePassesB) return -1;
      if (routePassesB && !routePassesA) return 1;
      
      // Factor 4: Time proximity
      const requestedTime = new Date(criteria.departureTime).getTime();
      const timeA = Math.abs(new Date(a.departureTime).getTime() - requestedTime);
      const timeB = Math.abs(new Date(b.departureTime).getTime() - requestedTime);
      
      return timeA - timeB;
    });
  }
}

export default RideService;
