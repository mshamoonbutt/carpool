// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginBox from "./pages/LoginBox";
import SignupBox from "./pages/SignupBox";
import MainPage from './pages/MainPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      setIsAuthenticated(!!currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Setup test users on app start
  useEffect(() => {
    const setupTestUsers = () => {
      // Check if test users already exist
      const existingUsers = localStorage.getItem('users');
      if (!existingUsers) {
        // Create test users
        const testUsers = [
          {
            id: 'student1',
            name: 'Student1',
            email: 'student1@formanite.fccollege.edu.pk',
            password: 'password123',
            type: 'student',
            ratings: {
              rider: { average: 4.8, count: 15 },
              driver: { average: 4.9, count: 8 }
            }
          },
          {
            id: 'student2', 
            name: 'Student2',
            email: 'student2@formanite.fccollege.edu.pk',
            password: 'password123',
            type: 'student',
            ratings: {
              rider: { average: 4.7, count: 12 },
              driver: { average: 4.8, count: 10 }
            }
          }
        ];
        
        localStorage.setItem('users', JSON.stringify(testUsers));
        console.log('✅ Test users created automatically');
        console.log('Student1: student1@formanite.fccollege.edu.pk (for finding rides)');
        console.log('Student2: student2@formanite.fccollege.edu.pk (for posting rides)');
        console.log('Password: password123');
      }
    };

    setupTestUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginBox />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupBox />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;