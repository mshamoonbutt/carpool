/**
 * DataService - A service to manage localStorage as a database
 * This simulates a backend for a Junior track implementation
 */
class DataService {
  constructor() {
    this.DB_KEY = 'unipool_db'; // localStorage key
    this.initializeData();
  }

  async initializeData() {
    // Check if data exists in localStorage
    if (!localStorage.getItem(this.DB_KEY)) {
      // Initialize with an empty database structure
      const initialData = {
        users: [],
        rides: [],
        bookings: []
      };
      
      // Save to localStorage
      this.saveData(initialData);
    }
  }

  getData() {
    try {
      // Get and parse data from localStorage
      const data = JSON.parse(localStorage.getItem(this.DB_KEY));
      return data || { users: [], rides: [], bookings: [] };
    } catch (error) {
      console.error('Error retrieving data:', error);
      return { users: [], rides: [], bookings: [] };
    }
  }

  saveData(data) {
    try {
      // Save data to localStorage
      localStorage.setItem(this.DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Helper method for generating IDs
  generateId(prefix) {
    return `${prefix}${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  // User Management Methods
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('unipool_current_user'));
  }

  setCurrentUser(user) {
    localStorage.setItem('unipool_current_user', JSON.stringify(user));
  }

  getAllUsers() {
    const data = this.getData();
    return data.users || [];
  }

  getUserById(userId) {
    const data = this.getData();
    return data.users.find(user => user.id === userId) || null;
  }

  addUser(userData) {
    const data = this.getData();
    
    // Check if email already exists
    const existingUser = data.users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user with ID
    const newUser = {
      ...userData,
      id: this.generateId('u'),
      ratings: {
        driver: userData.role === 'rider' ? null : { total: 0, count: 0 },
        rider: userData.role === 'driver' ? null : { total: 0, count: 0 }
      }
    };
    
    // Add to users array
    data.users.push(newUser);
    this.saveData(data);
    
    return newUser;
  }

  updateUser(userId, updates) {
    const data = this.getData();
    const userIndex = data.users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user data
    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    this.saveData(data);
    
    return data.users[userIndex];
  }
  
  // Ride Management Methods
  getAllRides(filters = {}) {
    const data = this.getData();
    let rides = data.rides || [];
    
    // Apply filters if provided
    if (filters.pickup) {
      rides = rides.filter(ride => 
        ride.pickup.toLowerCase().includes(filters.pickup.toLowerCase()) ||
        (ride.route && ride.route.some(point => 
          point.toLowerCase().includes(filters.pickup.toLowerCase())))
      );
    }
    
    if (filters.dropoff) {
      rides = rides.filter(ride => 
        ride.dropoff.toLowerCase().includes(filters.dropoff.toLowerCase())
      );
    }
    
    if (filters.departureTime) {
      // Filter rides within ±30 minutes of the requested time
      const requestTime = new Date(filters.departureTime).getTime();
      const timeWindow = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      rides = rides.filter(ride => {
        const rideTime = new Date(ride.departureTime).getTime();
        return Math.abs(rideTime - requestTime) <= timeWindow;
      });
    }
    
    // Sort by departure time (ascending)
    rides.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    
    return rides;
  }
  
  getRideById(rideId) {
    const data = this.getData();
    return data.rides.find(ride => ride.id === rideId) || null;
  }
  
  addRide(rideData) {
    const data = this.getData();
    const driver = this.getUserById(rideData.driverId);
    
    if (!driver) {
      throw new Error('Driver not found');
    }
    
    // Create new ride with ID
    const newRide = {
      ...rideData,
      id: this.generateId('r'),
      driverName: driver.name,
      bookings: [],
      availableSeats: rideData.seats,
    };
    
    // Add to rides array
    data.rides.push(newRide);
    this.saveData(data);
    
    return newRide;
  }
  
  updateRide(rideId, updates) {
    const data = this.getData();
    const rideIndex = data.rides.findIndex(ride => ride.id === rideId);
    
    if (rideIndex === -1) {
      throw new Error('Ride not found');
    }
    
    // Update ride data
    data.rides[rideIndex] = { ...data.rides[rideIndex], ...updates };
    this.saveData(data);
    
    return data.rides[rideIndex];
  }
  
  deleteRide(rideId) {
    const data = this.getData();
    const rideIndex = data.rides.findIndex(ride => ride.id === rideId);
    
    if (rideIndex === -1) {
      throw new Error('Ride not found');
    }
    
    // Remove ride
    data.rides.splice(rideIndex, 1);
    
    // Remove associated bookings
    data.bookings = data.bookings.filter(booking => booking.rideId !== rideId);
    
    this.saveData(data);
    
    return { success: true };
  }
  
  // Booking Management Methods
  getAllBookings(filters = {}) {
    const data = this.getData();
    let bookings = data.bookings || [];
    
    if (filters.riderId) {
      bookings = bookings.filter(booking => booking.riderId === filters.riderId);
    }
    
    if (filters.driverId) {
      bookings = bookings.filter(booking => booking.driverId === filters.driverId);
    }
    
    if (filters.rideId) {
      bookings = bookings.filter(booking => booking.rideId === filters.rideId);
    }
    
    return bookings;
  }
  
  getBookingById(bookingId) {
    const data = this.getData();
    return data.bookings.find(booking => booking.id === bookingId) || null;
  }
  
  bookRide(bookingData) {
    const data = this.getData();
    const ride = this.getRideById(bookingData.rideId);
    
    if (!ride) {
      throw new Error('Ride not found');
    }
    
    if (ride.availableSeats <= 0) {
      throw new Error('No seats available');
    }
    
    const rider = this.getUserById(bookingData.riderId);
    
    if (!rider) {
      throw new Error('Rider not found');
    }
    
    // Create booking
    const newBooking = {
      ...bookingData,
      id: this.generateId('b'),
      driverId: ride.driverId,
      status: 'confirmed',
      bookingTime: new Date().toISOString(),
    };
    
    // Add booking to bookings array
    data.bookings.push(newBooking);
    
    // Update ride's bookings and available seats
    const rideIndex = data.rides.findIndex(r => r.id === ride.id);
    data.rides[rideIndex].bookings.push({
      riderId: rider.id,
      riderName: rider.name,
      pickupPoint: bookingData.pickupPoint,
      status: 'confirmed'
    });
    
    data.rides[rideIndex].availableSeats -= 1;
    
    this.saveData(data);
    
    return newBooking;
  }
  
  cancelBooking(bookingId) {
    const data = this.getData();
    const bookingIndex = data.bookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }
    
    const booking = data.bookings[bookingIndex];
    const ride = this.getRideById(booking.rideId);
    
    if (!ride) {
      throw new Error('Associated ride not found');
    }
    
    // Check cancellation time
    const now = new Date();
    const departureTime = new Date(ride.departureTime);
    const timeDiff = departureTime - now;
    const hourInMillis = 60 * 60 * 1000;
    
    // Update booking status
    data.bookings[bookingIndex].status = 'cancelled';
    
    // Apply penalty if cancelled less than 1 hour before departure
    if (timeDiff < hourInMillis) {
      data.bookings[bookingIndex].penaltyApplied = true;
      // Automatic 2-star rating would be applied here
    }
    
    // Remove booking from ride and increase available seats
    const rideIndex = data.rides.findIndex(r => r.id === ride.id);
    const rideBookingIndex = data.rides[rideIndex].bookings.findIndex(
      b => b.riderId === booking.riderId
    );
    
    if (rideBookingIndex !== -1) {
      data.rides[rideIndex].bookings.splice(rideBookingIndex, 1);
      data.rides[rideIndex].availableSeats += 1;
    }
    
    this.saveData(data);
    
    return { success: true, penaltyApplied: timeDiff < hourInMillis };
  }
  
  // Rating System Methods
  addRating(ratingData) {
    const data = this.getData();
    const { rideId, raterId, ratedId, rating, type, review } = ratingData;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    // Find the rated user
    const userIndex = data.users.findIndex(user => user.id === ratedId);
    if (userIndex === -1) {
      throw new Error('Rated user not found');
    }
    
    // Update user's ratings
    const user = data.users[userIndex];
    const ratingType = type === 'driver' ? 'driver' : 'rider';
    
    if (!user.ratings[ratingType]) {
      user.ratings[ratingType] = { total: 0, count: 0 };
    }
    
    user.ratings[ratingType].total += rating;
    user.ratings[ratingType].count += 1;
    
    // Create rating record
    const newRating = {
      id: this.generateId('rt'),
      rideId,
      raterId,
      ratedId,
      rating,
      type,
      review: review || '',
      createdAt: new Date().toISOString()
    };
    
    // Add or update ratings array if it doesn't exist
    if (!data.ratings) {
      data.ratings = [];
    }
    
    data.ratings.push(newRating);
    
    this.saveData(data);
    
    return newRating;
  }
  
  getRatingsByUserId(userId, type) {
    const data = this.getData();
    
    // If ratings array doesn't exist, return empty array
    if (!data.ratings) return [];
    
    // Filter ratings by userId and type (if provided)
    return data.ratings.filter(rating => {
      if (rating.ratedId !== userId) return false;
      if (type && rating.type !== type) return false;
      return true;
    });
  }

  // Reset database (for testing)
  resetDatabase() {
    localStorage.removeItem(this.DB_KEY);
    localStorage.removeItem('unipool_current_user');
    this.initializeData();
  }
}

// Create a singleton instance
const dataService = new DataService();

export default dataService;
