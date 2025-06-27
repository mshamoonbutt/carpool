// src/services/AuthService.js
class AuthService {
    static async login(email, password) {
      // TODO: Implement actual login logic
      // This is just a mock implementation
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email.endsWith('@formanite.fccollege.edu.pk') && password) {
            resolve({ email, name: 'Test User' });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 1000);
      });
    }
  }
  
  export default AuthService;