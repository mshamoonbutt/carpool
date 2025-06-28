import DataService from './DataService';

// Simulating async API behavior
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * UserService - Handles all user-related operations
 */
class UserService {
  /**
   * Register a new user
   * @param {Object} userData User data including email, name, role, etc.
   * @returns {Promise<Object>} The newly created user
   */
  static async register(userData) {
    try {
      // Validate email domain
      if (!this.validateEmail(userData.email)) {
        throw new Error('Invalid email domain. Must be a valid university email.');
      }

      // Simulate API delay
      await delay(300);
      
      // Add user to database
      const newUser = DataService.addUser(userData);
      
      // Set as current user
      DataService.setCurrentUser(newUser);
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Login a user
   * @param {string} email User email
   * @param {string} password User password (not implemented for this demo)
   * @returns {Promise<Object>} The user object
   */
  static async login(email) {
    try {
      // Simulate API delay
      await delay(300);
      
      // Find user by email
      const users = DataService.getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Set as current user
      DataService.setCurrentUser(user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Get current logged-in user
   * @returns {Promise<Object|null>} The current user or null
   */
  static async getCurrentUser() {
    // Simulate API delay
    await delay(100);
    
    return DataService.getCurrentUser();
  }
  
  /**
   * Logout current user
   * @returns {Promise<Object>} Success status
   */
  static async logout() {
    // Simulate API delay
    await delay(100);
    
    localStorage.removeItem('unipool_current_user');
    
    return { success: true };
  }
  
  /**
   * Get a user by ID
   * @param {string} userId The user ID
   * @returns {Promise<Object>} The user object
   */
  static async getUserById(userId) {
    // Simulate API delay
    await delay(100);
    
    const user = DataService.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
  
  /**
   * Update a user's profile
   * @param {string} userId The user ID
   * @param {Object} updates The updates to apply
   * @returns {Promise<Object>} The updated user
   */
  static async updateProfile(userId, updates) {
    try {
      // Simulate API delay
      await delay(200);
      
      const updatedUser = DataService.updateUser(userId, updates);
      
      // Update current user if it's the same user
      const currentUser = DataService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        DataService.setCurrentUser(updatedUser);
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
  
  /**
   * Get a user's ratings
   * @param {string} userId The user ID
   * @param {string} type Optional: 'driver' or 'rider'
   * @returns {Promise<Array>} The ratings
   */
  static async getUserRatings(userId, type) {
    // Simulate API delay
    await delay(200);
    
    return DataService.getRatingsByUserId(userId, type);
  }
  
  /**
   * Validate email domain (for university emails)
   * @param {string} email The email to validate
   * @returns {boolean} Whether the email is valid
   */
  static validateEmail(email) {
    // For student emails: must end with formanite.fccollege.edu.pk
    // For faculty/staff (optional): must end with fccollege.edu.pk
    const emailPattern = /^[^@]+@(formanite\.fccollege\.edu\.pk|fccollege\.edu\.pk)$/i;
    return emailPattern.test(email);
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Whether the user is authenticated
   */
  static isAuthenticated() {
    return !!DataService.getCurrentUser();
  }
}

export default UserService;
