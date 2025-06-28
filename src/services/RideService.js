// services/RideService.js
// Senior Track Implementation - REST-like service layer

class RideService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  // Ride Management Methods
  async getRides(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.baseURL}/rides?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }

      return await response.json();
    } catch (error) {
      console.error('Get rides error:', error);
      throw error;
    }
  }

  async getRideById(rideId) {
    try {
      const response = await fetch(`${this.baseURL}/rides/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Ride not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get ride by ID error:', error);
      throw error;
    }
  }

  async createRide(rideData) {
    try {
      // Validate ride data
      this.validateRideData(rideData);

      const response = await fetch(`${this.baseURL}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...rideData,
          status: 'active',
          availableSeats: rideData.seats,
          bookings: [],
          createdAt: new Date().toISOString(),
          timezone: 'Asia/Karachi' // PKT
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create ride');
      }

      return await response.json();
    } catch (error) {
      console.error('Create ride error:', error);
      throw error;
    }
  }

  async updateRide(rideId, updates) {
    try {
      const response = await fetch(`${this.baseURL}/rides/${rideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update ride');
      }

      return await response.json();
    } catch (error) {
      console.error('Update ride error:', error);
      throw error;
    }
  }

  async cancelRide(rideId) {
    try {
      const response = await fetch(`${this.baseURL}/rides/${rideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel ride');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel ride error:', error);
      throw error;
    }
  }

  // Search and Filtering
  async searchRides(searchParams) {
    try {
      const queryParams = new URLSearchParams(searchParams);
      const response = await fetch(`${this.baseURL}/rides/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Search rides error:', error);
      throw error;
    }
  }

  async getRidesByRoute(pickup, dropoff, timeWindow = null) {
    try {
      const params = { pickup, dropoff };
      if (timeWindow) {
        params.timeWindow = timeWindow;
      }

      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${this.baseURL}/rides/route?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rides by route');
      }

      return await response.json();
    } catch (error) {
      console.error('Get rides by route error:', error);
      throw error;
    }
  }

  // Booking Management
  async bookRide(rideId, bookingData) {
    try {
      // Validate booking data
      this.validateBookingData(bookingData);

      const response = await fetch(`${this.baseURL}/rides/${rideId}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...bookingData,
          status: 'pending',
          bookingTime: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Booking failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Book ride error:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId) {
    try {
      const response = await fetch(`${this.baseURL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  async getUserBookings(userId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.baseURL}/users/${userId}/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  // Recurring Rides
  async createRecurringRide(recurringData) {
    try {
      const response = await fetch(`${this.baseURL}/rides/recurring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...recurringData,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create recurring ride');
      }

      return await response.json();
    } catch (error) {
      console.error('Create recurring ride error:', error);
      throw error;
    }
  }

  // Conflict Resolution
  async checkBookingConflicts(rideId, bookingData) {
    try {
      const response = await fetch(`${this.baseURL}/rides/${rideId}/conflicts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to check conflicts');
      }

      return await response.json();
    } catch (error) {
      console.error('Check booking conflicts error:', error);
      throw error;
    }
  }

  // Validation Methods
  validateRideData(rideData) {
    const required = ['pickup', 'dropoff', 'departureTime', 'seats'];
    const missing = required.filter(field => !rideData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (rideData.seats < 1 || rideData.seats > 6) {
      throw new Error('Seats must be between 1 and 6');
    }

    const departureTime = new Date(rideData.departureTime);
    const now = new Date();
    
    if (departureTime <= now) {
      throw new Error('Departure time must be in the future');
    }

    // Check reasonable hours (6 AM to 10 PM)
    const hour = departureTime.getHours();
    if (hour < 6 || hour > 22) {
      throw new Error('Rides can only be scheduled between 6 AM and 10 PM');
    }
  }

  validateBookingData(bookingData) {
    const required = ['pickupPoint', 'dropoffPoint'];
    const missing = required.filter(field => !bookingData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  // Utility Methods
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Time window calculation (±30 minutes)
  calculateTimeWindow(departureTime) {
    const time = new Date(departureTime);
    const start = new Date(time.getTime() - 30 * 60 * 1000); // 30 minutes before
    const end = new Date(time.getTime() + 30 * 60 * 1000);   // 30 minutes after
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  // Check if booking is within cancellation window (1 hour before departure)
  canCancelBooking(booking) {
    const departureTime = new Date(booking.ride.departureTime);
    const now = new Date();
    const oneHourBefore = new Date(departureTime.getTime() - 60 * 60 * 1000);
    
    return now < oneHourBefore;
  }

  // Calculate cancellation penalty
  calculateCancellationPenalty(booking) {
    if (this.canCancelBooking(booking)) {
      return 0; // No penalty
    }
    
    return 2; // 2-star penalty for late cancellation
  }
}

export default new RideService(); 