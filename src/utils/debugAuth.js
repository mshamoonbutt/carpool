// Debug Authentication Utility
// This helps identify authentication issues

export const debugAuthentication = () => {
  console.log('🔍 === AUTHENTICATION DEBUG ===');
  
  // Check localStorage
  const currentUser = localStorage.getItem('currentUser');
  const users = localStorage.getItem('users');
  
  console.log('📦 localStorage.currentUser:', currentUser ? JSON.parse(currentUser) : null);
  console.log('📦 localStorage.users:', users ? JSON.parse(users).length + ' users' : 'No users');
  
  // Check AuthService
  try {
    const AuthService = require('../services/AuthService').default;
    const authUser = AuthService.getCurrentUser();
    const isAuth = AuthService.isAuthenticated();
    
    console.log('🔐 AuthService.getCurrentUser():', authUser);
    console.log('🔐 AuthService.isAuthenticated():', isAuth);
  } catch (error) {
    console.log('❌ AuthService error:', error.message);
  }
  
  // Check current URL
  console.log('🌐 Current URL:', window.location.href);
  console.log('🌐 Current pathname:', window.location.pathname);
  
  // Check if we're in a protected route
  const protectedRoutes = ['/dashboard', '/test'];
  const isProtectedRoute = protectedRoutes.includes(window.location.pathname);
  console.log('🛡️ Is protected route:', isProtectedRoute);
  
  // Check if we're in a public route
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(window.location.pathname);
  console.log('🌍 Is public route:', isPublicRoute);
  
  console.log('🔍 === END DEBUG ===');
};

export const clearAllAuth = () => {
  console.log('🧹 Clearing all authentication...');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('users');
  window.dispatchEvent(new Event('authChange'));
  console.log('✅ All authentication cleared');
};

export const simulateFreshStart = () => {
  console.log('🔄 Simulating fresh application start...');
  
  // Clear everything
  clearAllAuth();
  
  // Reload the page
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

// Export for browser console
window.debugAuth = debugAuthentication;
window.clearAllAuth = clearAllAuth;
window.simulateFreshStart = simulateFreshStart; 