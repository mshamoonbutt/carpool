import { createBrowserRouter } from 'react-router-dom';
import MainPage from './pages/MainPage.jsx';
import LoginBox from './pages/LoginBox.jsx';
import SignupBox from './pages/SignupBox.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TestPage from './pages/TestPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PublicRoute from './components/auth/PublicRoute.jsx';

// Error component for router
const ErrorPage = () => (
  <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-4">
    <div className="bg-red-800 p-6 rounded-lg max-w-md">
      <h1 className="text-2xl font-bold mb-4">❌ Page Not Found</h1>
      <p className="mb-4">The page you're looking for doesn't exist.</p>
      <button 
        onClick={() => window.location.href = '/'} 
        className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
      >
        Go Home
      </button>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginBox />
      </PublicRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignupBox />
      </PublicRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  },
  {
    path: '/test',
    element: (
      <ProtectedRoute>
        <TestPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />
  }
]);