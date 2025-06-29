import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('🔍 PublicRoute: Checking if user is already authenticated...');
        const currentUser = AuthService.getCurrentUser();
        
        if (currentUser) {
          console.log('✅ PublicRoute: User already authenticated, redirecting to dashboard');
          setIsLoading(false);
          navigate(redirectTo, { replace: true });
          return;
        }

        console.log('✅ PublicRoute: User not authenticated, showing public page');
        setIsLoading(false);
      } catch (error) {
        console.error('❌ PublicRoute: Auth check error:', error);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      console.log('🔄 PublicRoute: Auth change detected, rechecking...');
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1E293B] to-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default PublicRoute; 