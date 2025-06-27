import DataService from './DataService';

class UserService {
  static async register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate email domain
          if (!userData.email.endsWith('@formanite.fccollege.edu.pk')) {
            throw new Error('Only Forman Christian College emails allowed');
          }

          // Check if user exists
          if (DataService.getUserByEmail(userData.email)) {
            throw new Error('Email already registered');
          }

          // Create new user
          const newUser = {
            id: `u${Date.now()}`,
            ...userData,
            ratings: {
              driver: null,
              rider: null
            },
            createdAt: new Date().toISOString()
          };

          // Save to DB
          DataService.addUser(newUser);

          // Auto-login
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          resolve(newUser);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  static async updateProfile(userId, updates) {
    // Implementation similar to register
  }
}

export default UserService;