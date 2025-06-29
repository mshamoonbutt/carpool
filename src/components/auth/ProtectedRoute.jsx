import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('🔍 ProtectedRoute: Checking authentication...');
        const currentUser = AuthService.getCurrentUser();
        
        if (!currentUser) {
          console.log('❌ ProtectedRoute: No user found, redirecting to login');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate(redirectTo, { 
            replace: true,
            state: { from: location.pathname }
          });
          return;
        }

        console.log('✅ ProtectedRoute: User authenticated:', currentUser.name);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ ProtectedRoute: Auth check error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate(redirectTo, { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      console.log('🔄 ProtectedRoute: Auth change detected, rechecking...');
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [navigate, redirectTo, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1E293B] to-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return children;
};

export default ProtectedRoute; 