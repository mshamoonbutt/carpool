import AuthService from '../services/AuthService';
import UserService from '../services/UserService';

const testBackend = async () => {
  console.log('=== Testing Authentication ===');
  
  try {
    // Test registration
    console.log('Registering new user...');
    const newUser = await UserService.register({
      email: 'testuser@formanite.fccollege.edu.pk',
      password: 'test123',
      name: 'Test User',
      role: 'rider',
      major: 'Computer Science',
      year: 2,
      phone: '0300-0000000'
    });
    console.log('Registration success:', newUser);

    // Test login
    console.log('Testing login...');
    const loggedInUser = await AuthService.login(
      'testuser@formanite.fccollege.edu.pk',
      'test123'
    );
    console.log('Login success:', loggedInUser);

    // Test persistence
    console.log('Checking persistence...');
    const currentUser = AuthService.getCurrentUser();
    console.log('Current user:', currentUser);

    // Test logout
    await AuthService.logout();
    console.log('Logout successful');

    console.log('=== ALL BACKEND TESTS PASSED ===');
  } catch (error) {
    console.error('Backend test failed:', error);
  }
};

// Run tests when imported
testBackend();