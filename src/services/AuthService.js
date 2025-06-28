import DataService from './DataService';

class AuthService {
  static async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        try {
          console.log('🔐 AuthService: Attempting login for:', email);
          
          if (!email.endsWith('@formanite.fccollege.edu.pk')) {
            throw new Error('Only university emails allowed');
          }

          // First try to get user from main users list (App.jsx test users)
          const mainUsers = JSON.parse(localStorage.getItem('users') || '[]');
          console.log('🔐 AuthService: Main users found:', mainUsers.length);
          
          let user = mainUsers.find(u => u.email === email);
          
          if (!user) {
            console.log('🔐 AuthService: User not found in main users, trying DataService...');
            // Fallback to DataService
            user = DataService.getUserByEmail(email);
          }

          if (!user) {
            console.log('❌ AuthService: User not found anywhere');
            throw new Error('User not found');
          }

          console.log('🔐 AuthService: User found:', user.name);

          // In real app, compare hashed passwords
          if (user.password !== password) {
            console.log('❌ AuthService: Invalid password');
            throw new Error('Invalid password');
          }

          console.log('✅ AuthService: Login successful, storing user...');
          
          // Store current user
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('✅ AuthService: User stored in localStorage');
          
          resolve(user);
        } catch (error) {
          console.error('❌ AuthService: Login error:', error);
          reject(error);
        }
      }, 500);
    });
  }

  static logout() {
    console.log('🔐 AuthService: Logging out...');
    localStorage.removeItem('currentUser');
    return Promise.resolve();
  }

  static getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

export default AuthService;