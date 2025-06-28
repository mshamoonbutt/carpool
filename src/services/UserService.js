// services/UserService.js
// Senior Track Implementation - REST-like service layer

class UserService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.currentUser = null;
  }

  // Authentication Methods
  async register(userData) {
    try {
      // Validate university email domain
      if (!this.validateUniversityEmail(userData.email)) {
        throw new Error('Invalid university email domain. Use formanite.fccollege.edu.pk');
      }

      const response = await fetch(`${this.baseURL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          role: userData.role || 'rider', // Default to rider
          ratings: {
            driver: null,
            rider: null
          },
          createdAt: new Date().toISOString(),
          timezone: 'Asia/Karachi' // PKT
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const user = await response.json();
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user, token } = await response.json();
      this.setCurrentUser(user);
      localStorage.setItem('authToken', token);
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearCurrentUser();
      localStorage.removeItem('authToken');
    }
  }

  // User Profile Methods
  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = this.getAuthToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        this.setCurrentUser(user);
        return user;
      }
    } catch (error) {
      console.error('Get current user error:', error);
    }

    return null;
  }

  async getUserById(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('User not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  async updateProfile(userId, updates) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      const updatedUser = await response.json();
      
      // Update current user if it's the same user
      if (this.currentUser && this.currentUser.id === userId) {
        this.setCurrentUser(updatedUser);
      }

      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Rating Methods
  async getUserRatings(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/ratings`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user ratings error:', error);
      throw error;
    }
  }

  async submitRating(ratingData) {
    try {
      const response = await fetch(`${this.baseURL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          ...ratingData,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Rating submission failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Submit rating error:', error);
      throw error;
    }
  }

  // Ride History
  async getRideHistory(userId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.baseURL}/users/${userId}/rides?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ride history');
      }

      return await response.json();
    } catch (error) {
      console.error('Get ride history error:', error);
      throw error;
    }
  }

  // Utility Methods
  validateUniversityEmail(email) {
    const validDomains = [
      'formanite.fccollege.edu.pk'
    ];
    
    return validDomains.some(domain => email.toLowerCase().endsWith(domain));
  }

  isAuthenticated() {
    return !!this.getAuthToken() && !!this.currentUser;
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  clearCurrentUser() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Safety Features
  isWithinReasonableHours() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour <= 22; // 6 AM to 10 PM
  }

  getUserSafetyScore(userId) {
    // Calculate safety score based on ratings and history
    // This would be implemented with actual user data
    return {
      rating: 4.5,
      ridesCompleted: 25,
      cancellations: 2,
      warnings: 0,
      isFlagged: false
    };
  }
}

export default new UserService();