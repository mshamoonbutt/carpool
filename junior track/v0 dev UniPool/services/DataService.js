// services/DataService.js
// ENHANCED: Added multi-user simulation support with polling and event listeners

class DataService {
  constructor() {
    this.DB_KEY = 'unipool_db';
    this.listeners = new Set(); // NEW: Event listeners for real-time updates
    this.initializeData();
    this.setupStorageListener(); // NEW: Listen for storage changes across tabs
  }

  // NEW: Setup storage event listener for cross-tab communication
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.DB_KEY) {
        // Notify all components that data has changed
        this.notifyListeners();
      }
    });
  }

  // NEW: Subscribe to data changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback); // Return unsubscribe function
  }

  // NEW: Notify all listeners of data changes
  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // ENHANCED: Added timestamp for better tracking
  saveData(data) {
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(this.DB_KEY, JSON.stringify(dataWithTimestamp));
    this.notifyListeners(); // NEW: Notify components of changes
  }

  // ENHANCED: Added better error handling and fallback
  getData() {
    try {
      const data = localStorage.getItem(this.DB_KEY);
      if (!data) {
        return this.getDefaultData();
      }
      const parsed = JSON.parse(data);
      // Remove timestamp before returning
      const { lastUpdated, ...cleanData } = parsed;
      return cleanData;
    } catch (error) {
      console.error('Error parsing data from localStorage:', error);
      return this.getDefaultData();
    }
  }

  // NEW: Get default data structure
  getDefaultData() {
    return {
      users: [],
      rides: [],
      bookings: [],
      ratings: []
    };
  }

  // ENHANCED: Added real-time booking with automatic notifications
  bookRide(rideId, bookingData) {
    const data = this.getData();
    const ride = data.rides.find(r => r.id === rideId);
    
    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.availableSeats <= 0) {
      throw new Error('No seats available');
    }

    // Create new booking
    const booking = {
      id: this.generateId('b'),
      rideId,
      riderId: bookingData.riderId,
      driverId: ride.driverId,
      status: 'confirmed',
      pickupPoint: bookingData.pickupPoint,
      bookingTime: new Date().toISOString()
    };

    // Add booking to ride
    ride.bookings = ride.bookings || [];
    ride.bookings.push({
      riderId: booking.riderId,
      riderName: bookingData.riderName,
      pickupPoint: booking.pickupPoint,
      status: 'confirmed'
    });

    // Decrease available seats
    ride.availableSeats = Math.max(0, ride.availableSeats - 1);

    // Add to bookings array
    data.bookings.push(booking);

    this.saveData(data); // This will automatically notify all tabs
    return booking;
  }

  // ENHANCED: Added automatic notification on ride creation
  addRide(rideData) {
    const data = this.getData();
    const ride = {
      id: this.generateId('r'),
      ...rideData,
      bookings: [],
      availableSeats: rideData.seats,
      createdAt: new Date().toISOString()
    };
    
    data.rides.push(ride);
    this.saveData(data); // This will automatically notify all tabs
    return ride;
  }

  // ENHANCED: Cancel booking with automatic sync
  cancelBooking(bookingId) {
    const data = this.getData();
    const booking = data.bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    const ride = data.rides.find(r => r.id === booking.rideId);
    if (ride) {
      // Remove booking from ride
      ride.bookings = ride.bookings.filter(b => b.riderId !== booking.riderId);
      // Increase available seats
      ride.availableSeats = Math.min(ride.seats, ride.availableSeats + 1);
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();

    this.saveData(data); // This will automatically notify all tabs
    return true;
  }

  // NEW: Get rides for current user (driver's rides)
  getUserRides(userId) {
    const data = this.getData();
    return data.rides.filter(ride => ride.driverId === userId);
  }

  // NEW: Get bookings for current user (rider's bookings)
  getUserBookings(userId) {
    const data = this.getData();
    return data.bookings.filter(booking => booking.riderId === userId);
  }

  // NEW: Get pending bookings count for driver (for notifications)
  getPendingBookingsCount(driverId) {
    const data = this.getData();
    const driverRides = data.rides.filter(ride => ride.driverId === driverId);
    let totalBookings = 0;
    
    driverRides.forEach(ride => {
      totalBookings += (ride.bookings || []).length;
    });
    
    return totalBookings;
  }

  // UNCHANGED: Keep existing methods intact
  async initializeData() {
    const existingData = localStorage.getItem(this.DB_KEY);
    if (!existingData) {
      try {
        const response = await fetch('/db.json');
        const data = await response.json();
        this.saveData(data);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        this.saveData(this.getDefaultData());
      }
    }
  }

  getRides(filters = {}) {
    const data = this.getData();
    let rides = data.rides || [];

    // Apply filters
    if (filters.pickup) {
      rides = rides.filter(ride => 
        ride.pickup.toLowerCase().includes(filters.pickup.toLowerCase()) ||
        (ride.route && ride.route.some(point => 
          point.toLowerCase().includes(filters.pickup.toLowerCase())
        ))
      );
    }

    if (filters.dropoff) {
      rides = rides.filter(ride => 
        ride.dropoff.toLowerCase().includes(filters.dropoff.toLowerCase())
      );
    }

    if (filters.date) {
      rides = rides.filter(ride => {
        const rideDate = new Date(ride.departureTime).toDateString();
        const filterDate = new Date(filters.date).toDateString();
        return rideDate === filterDate;
      });
    }

    // Only return rides with available seats
    rides = rides.filter(ride => ride.availableSeats > 0);

    // Sort by departure time
    rides.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

    return rides;
  }

  getRideById(rideId) {
    const data = this.getData();
    return data.rides.find(ride => ride.id === rideId);
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
}

export default new DataService();