// src/App.jsx
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.jsx';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('🚀 App.jsx: Initializing...');
      
      // Clear any existing test users to ensure fresh passwords
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      console.log('🔍 App.jsx: Existing users found:', existingUsers.length);
      
      // Set up test users with correct credentials
      const testUsers = [
        {
          id: 'test1',
          name: 'Student One',
          email: 'student1@formanite.fccollege.edu.pk',
          password: 'temp123',
          type: 'student',
          ratings: { driver: { average: 4.5, count: 12 }, rider: { average: 4.8, count: 8 } }
        },
        {
          id: 'test2',
          name: 'Student Two',
          email: 'student2@formanite.fccollege.edu.pk',
          password: 'temp',
          type: 'student',
          ratings: { driver: { average: 4.2, count: 15 }, rider: { average: 4.6, count: 10 } }
        }
      ];
      
      localStorage.setItem('users', JSON.stringify(testUsers));
      console.log('✅ App.jsx: Test users set up:', testUsers.map(u => ({ name: u.name, email: u.email })));
      
      // Check if user is already logged in
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('🔍 App.jsx: Found stored user:', user.name);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        console.log('🔍 App.jsx: No stored user found');
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

      // Listen for user login events
      const handleUserLogin = (event) => {
        console.log('🔄 App.jsx: User login event received:', event.detail);
        const user = event.detail;
        setCurrentUser(user);
        setIsAuthenticated(true);
      };

      window.addEventListener('authChange', handleAuthChange);
      window.addEventListener('userLoggedIn', handleUserLogin);

      // Debug function to check auth state
      window.checkAuthState = () => {
        console.log('🔍 Debug: Current auth state:', {
          isAuthenticated,
          currentUser: currentUser?.name,
          localStorageUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).name : null,
          testUsers: JSON.parse(localStorage.getItem('users') || '[]').map(u => ({ name: u.name, email: u.email }))
        });
      };

      // Debug function to clear auth
      window.clearAuth = () => {
        console.log('🧹 Debug: Clearing authentication...');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setIsAuthenticated(false);
        console.log('✅ Debug: Authentication cleared');
      };

      return () => {
        window.removeEventListener('authChange', handleAuthChange);
        window.removeEventListener('userLoggedIn', handleUserLogin);
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