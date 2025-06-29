// src/App.jsx
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.jsx';
import './App.css';
import { testRedirections } from './utils/routeTest.js';
import { debugAuthentication, clearAllAuth, simulateFreshStart } from './utils/debugAuth.js';
import { testAllLocations } from './utils/testLocations.js';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('🚀 App.jsx: Initializing...');
      
      // Set up comprehensive test users with proper roles
      const testUsers = [
        {
          id: 'driver1',
          name: 'Ali Hassan',
          email: 'ali.hassan@formanite.fccollege.edu.pk',
          password: 'temp123',
          role: 'driver',
          university: 'FCC University',
          profile: {
            major: 'Computer Science',
            year: 3,
            phone: '0300-1234567',
            vehicle: 'Honda City 2020',
            licensePlate: 'LHR-1234'
          },
          ratings: { 
            driver: { average: 4.5, count: 12 }, 
            rider: { average: 4.8, count: 8 } 
          },
          preferences: {
            notifications: true,
            quietHours: { start: '22:00', end: '06:00' }
          }
        },
        {
          id: 'rider1',
          name: 'Sara Khan',
          email: 'sara.khan@formanite.fccollege.edu.pk',
          password: 'temp123',
          role: 'rider',
          university: 'FCC University',
          profile: {
            major: 'Business Administration',
            year: 2,
            phone: '0321-7654321'
          },
          ratings: { 
            driver: { average: 0, count: 0 }, 
            rider: { average: 4.2, count: 15 } 
          },
          preferences: {
            notifications: true,
            quietHours: { start: '23:00', end: '07:00' }
          }
        },
        {
          id: 'both1',
          name: 'Ahmed Raza',
          email: 'ahmed.raza@formanite.fccollege.edu.pk',
          password: 'temp123',
          role: 'both',
          university: 'FCC University',
          profile: {
            major: 'Electrical Engineering',
            year: 4,
            phone: '0333-9876543',
            vehicle: 'Toyota Corolla 2019',
            licensePlate: 'LHR-5678'
          },
          ratings: { 
            driver: { average: 4.7, count: 20 }, 
            rider: { average: 4.6, count: 12 } 
          },
          preferences: {
            notifications: true,
            quietHours: { start: '21:00', end: '06:00' }
          }
        },
        {
          id: 'driver2',
          name: 'Fatima Ali',
          email: 'fatima.ali@formanite.fccollege.edu.pk',
          password: 'temp123',
          role: 'driver',
          university: 'FCC University',
          profile: {
            major: 'Psychology',
            year: 2,
            phone: '0301-1122334',
            vehicle: 'Suzuki Cultus 2021',
            licensePlate: 'LHR-9012'
          },
          ratings: { 
            driver: { average: 4.3, count: 8 }, 
            rider: { average: 4.9, count: 5 } 
          },
          preferences: {
            notifications: true,
            quietHours: { start: '22:30', end: '06:30' }
          }
        }
      ];
      
      localStorage.setItem('users', JSON.stringify(testUsers));
      console.log('✅ App.jsx: Test users set up:', testUsers.map(u => ({ 
        name: u.name, 
        email: u.email, 
        role: u.role 
      })));
      
      // Check if user is already logged in
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('🔍 App.jsx: Found stored user:', user.name);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ App.jsx: Error parsing stored user:', error);
          // Clear invalid user data
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('🔍 App.jsx: No stored user found');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }

      // Listen for authentication changes
      const handleAuthChange = () => {
        console.log('🔄 App.jsx: Auth change event received');
        const user = localStorage.getItem('currentUser');
        if (user) {
          const parsedUser = JSON.parse(user);
          console.log('✅ App.jsx: User authenticated:', parsedUser.name);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.log('❌ App.jsx: User logged out');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      };

      window.addEventListener('authChange', handleAuthChange);

      // Debug functions for testing
      window.checkAuthState = () => {
        console.log('🔍 Debug: Current auth state:', {
          isAuthenticated,
          currentUser: currentUser?.name,
          localStorageUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).name : null,
          testUsers: JSON.parse(localStorage.getItem('users') || '[]').map(u => ({ 
            name: u.name, 
            email: u.email, 
            role: u.role 
          }))
        });
      };

      window.clearAuth = () => {
        console.log('🧹 Debug: Clearing authentication...');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setIsAuthenticated(false);
        console.log('✅ Debug: Authentication cleared');
      };

      window.switchUser = (email) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          window.dispatchEvent(new Event('authChange'));
          console.log(`✅ Debug: Switched to user: ${user.name}`);
        } else {
          console.log(`❌ Debug: User not found: ${email}`);
        }
      };

      // Add route testing function
      window.testRedirections = testRedirections;
      
      // Add debug authentication functions
      window.debugAuth = debugAuthentication;
      window.clearAllAuth = clearAllAuth;
      window.simulateFreshStart = simulateFreshStart;
      
      // Add location testing function
      window.testAllLocations = testAllLocations;

      return () => {
        window.removeEventListener('authChange', handleAuthChange);
      };
    } catch (err) {
      console.error('❌ App.jsx: Error during initialization:', err);
      setError(err.message);
    }
  }, []);

  console.log('🔄 App.jsx: Render - isAuthenticated:', isAuthenticated, 'currentUser:', currentUser?.name);

  if (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-4">
        <div className="bg-red-800 p-6 rounded-lg max-w-md">
          <h1 className="text-2xl font-bold mb-4">❌ Application Error</h1>
          <p className="mb-4">Something went wrong during initialization:</p>
          <pre className="bg-red-900 p-3 rounded text-sm overflow-auto">{error}</pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;