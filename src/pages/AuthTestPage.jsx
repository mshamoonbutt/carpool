import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

const AuthTestPage = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    currentUser: null,
    localStorageUser: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    updateAuthState();
  }, []);

  const updateAuthState = () => {
    const currentUser = AuthService.getCurrentUser();
    const localStorageUser = localStorage.getItem('currentUser');
    
    setAuthState({
      isAuthenticated: AuthService.isAuthenticated(),
      currentUser: currentUser,
      localStorageUser: localStorageUser ? JSON.parse(localStorageUser) : null
    });
  };

  const handleLogin = async () => {
    try {
      await AuthService.login('ali.hassan@formanite.fccollege.edu.pk', 'temp123');
      updateAuthState();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      updateAuthState();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('authChange'));
    updateAuthState();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1E293B] to-[#0B1120] flex items-center justify-center p-4">
      <div className="bg-[#0F172A] bg-opacity-90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-center text-cyan-400 mb-8">
          🔐 Authentication Test Page
        </h1>

        <div className="space-y-6">
          {/* Current State */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Current Authentication State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Is Authenticated:</strong> <span className={authState.isAuthenticated ? 'text-green-400' : 'text-red-400'}>{authState.isAuthenticated ? '✅ Yes' : '❌ No'}</span></p>
              <p><strong>Current User:</strong> <span className="text-cyan-400">{authState.currentUser?.name || 'None'}</span></p>
              <p><strong>LocalStorage User:</strong> <span className="text-cyan-400">{authState.localStorageUser?.name || 'None'}</span></p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleLogin}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
            >
              🔐 Test Login
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition"
            >
              🚪 Test Logout
            </button>
            
            <button
              onClick={clearAuth}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition"
            >
              🧹 Clear Auth
            </button>
          </div>

          {/* Navigation Tests */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Navigation Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
              >
                ➡️ Go to Login
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition"
              >
                ➡️ Go to Dashboard
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> <span className="text-cyan-400">{window.location.href}</span></p>
              <p><strong>Current Path:</strong> <span className="text-cyan-400">{window.location.pathname}</span></p>
              <p><strong>Test Users Available:</strong> <span className="text-cyan-400">{JSON.parse(localStorage.getItem('users') || '[]').length}</span></p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Test Instructions</h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p>1. Click "Test Login" to authenticate with a test user</p>
              <p>2. Click "Go to Login" - should redirect to dashboard if authenticated</p>
              <p>3. Click "Go to Dashboard" - should work if authenticated, redirect to login if not</p>
              <p>4. Click "Test Logout" to clear authentication</p>
              <p>5. Try navigation again - should now redirect to login for dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage; 