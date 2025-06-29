import DataService from './DataService';

class AuthService {
  static async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        try {
          console.log('🔐 AuthService: Attempting login for:', email);
          
          // Validate university email
          if (!email.endsWith('@formanite.fccollege.edu.pk')) {
            throw new Error('Only university emails (@formanite.fccollege.edu.pk) are allowed');
          }

          // Get test users from localStorage
          const testUsers = JSON.parse(localStorage.getItem('users') || '[]');
          console.log('🔐 AuthService: Test users found:', testUsers.length);
          
          // Find user by email
          const user = testUsers.find(u => u.email === email);
          
          if (!user) {
            console.log('❌ AuthService: User not found');
            throw new Error('User not found. Please check your email or register.');
          }

          console.log('🔐 AuthService: User found:', user.name);

          // Simple password check (in real app, use hashed passwords)
          if (user.password !== password) {
            console.log('❌ AuthService: Invalid password');
            throw new Error('Invalid password. Please try again.');
          }

          console.log('✅ AuthService: Login successful, storing user...');
          
          // Store current user
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('✅ AuthService: User stored in localStorage');
          
          // Trigger auth change event
          window.dispatchEvent(new Event('authChange'));
          
          resolve(user);
        } catch (error) {
          console.error('❌ AuthService: Login error:', error);
          reject(error);
        }
      }, 500);
    });
  }

  static async logout() {
    console.log('🔐 AuthService: Logging out...');
    localStorage.removeItem('currentUser');
    
    // Trigger auth change event
    window.dispatchEvent(new Event('authChange'));
    
    return Promise.resolve();
  }

  static getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return !!this.getCurrentUser();
  }

  static validateEmail(email) {
    return email.endsWith('@formanite.fccollege.edu.pk');
  }
}

export default AuthService;