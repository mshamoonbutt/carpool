// Route Testing Utility
// This file contains functions to test all redirection flows

export const testRedirections = () => {
  console.log('🧪 Testing all redirection flows...');
  
  const tests = [
    {
      name: 'Test 1: Unauthenticated user accessing dashboard',
      test: () => {
        // Clear any existing auth
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new Event('authChange'));
        
        // Try to access dashboard
        window.location.href = '/dashboard';
        
        // Should redirect to login
        setTimeout(() => {
          const currentPath = window.location.pathname;
          console.log(`✅ Test 1: Current path is ${currentPath}`);
          if (currentPath === '/login') {
            console.log('✅ Test 1: PASSED - Redirected to login');
          } else {
            console.log('❌ Test 1: FAILED - Not redirected to login');
          }
        }, 1000);
      }
    },
    {
      name: 'Test 2: Authenticated user accessing login page',
      test: () => {
        // Set up test user
        const testUser = {
          id: 'test1',
          name: 'Test User',
          email: 'test@formanite.fccollege.edu.pk',
          password: 'temp123',
          type: 'student'
        };
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        window.dispatchEvent(new Event('authChange'));
        
        // Try to access login
        window.location.href = '/login';
        
        // Should redirect to dashboard
        setTimeout(() => {
          const currentPath = window.location.pathname;
          console.log(`✅ Test 2: Current path is ${currentPath}`);
          if (currentPath === '/dashboard') {
            console.log('✅ Test 2: PASSED - Redirected to dashboard');
          } else {
            console.log('❌ Test 2: FAILED - Not redirected to dashboard');
          }
        }, 1000);
      }
    },
    {
      name: 'Test 3: Login flow with valid credentials',
      test: async () => {
        // Clear auth first
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new Event('authChange'));
        
        // Go to login page
        window.location.href = '/login';
        
        setTimeout(async () => {
          try {
            // Simulate login
            const AuthService = (await import('../services/AuthService')).default;
            await AuthService.login('ali.hassan@formanite.fccollege.edu.pk', 'temp123');
            
            setTimeout(() => {
              const currentPath = window.location.pathname;
              console.log(`✅ Test 3: Current path is ${currentPath}`);
              if (currentPath === '/dashboard') {
                console.log('✅ Test 3: PASSED - Login successful and redirected');
              } else {
                console.log('❌ Test 3: FAILED - Login did not redirect properly');
              }
            }, 1500);
          } catch (error) {
            console.log('❌ Test 3: FAILED - Login error:', error.message);
          }
        }, 1000);
      }
    },
    {
      name: 'Test 4: Logout flow',
      test: async () => {
        // Ensure user is logged in first
        const testUser = {
          id: 'test4',
          name: 'Test User',
          email: 'test@formanite.fccollege.edu.pk',
          password: 'temp123',
          type: 'student'
        };
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        window.dispatchEvent(new Event('authChange'));
        
        // Go to dashboard
        window.location.href = '/dashboard';
        
        setTimeout(async () => {
          try {
            // Simulate logout
            const AuthService = (await import('../services/AuthService')).default;
            await AuthService.logout();
            
            setTimeout(() => {
              const currentPath = window.location.pathname;
              console.log(`✅ Test 4: Current path is ${currentPath}`);
              if (currentPath === '/login') {
                console.log('✅ Test 4: PASSED - Logout successful and redirected');
              } else {
                console.log('❌ Test 4: FAILED - Logout did not redirect properly');
              }
            }, 1000);
          } catch (error) {
            console.log('❌ Test 4: FAILED - Logout error:', error.message);
          }
        }, 1000);
      }
    },
    {
      name: 'Test 5: Signup flow',
      test: async () => {
        // Clear auth first
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new Event('authChange'));
        
        // Go to signup page
        window.location.href = '/signup';
        
        setTimeout(() => {
          const currentPath = window.location.pathname;
          console.log(`✅ Test 5: Current path is ${currentPath}`);
          if (currentPath === '/signup') {
            console.log('✅ Test 5: PASSED - Signup page accessible');
          } else {
            console.log('❌ Test 5: FAILED - Signup page not accessible');
          }
        }, 1000);
      }
    }
  ];
  
  // Run tests sequentially
  let currentTest = 0;
  
  const runNextTest = () => {
    if (currentTest < tests.length) {
      const test = tests[currentTest];
      console.log(`\n🧪 Running ${test.name}...`);
      test.test();
      currentTest++;
      setTimeout(runNextTest, 3000); // Wait 3 seconds between tests
    } else {
      console.log('\n✅ All redirection tests completed!');
    }
  };
  
  runNextTest();
};

// Export for use in browser console
window.testRedirections = testRedirections; 