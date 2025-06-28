// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthAPI from '../../services/AuthService';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('🔐 LoginForm: Starting login process...');
      const user = await AuthAPI.login(email, password);
      console.log('✅ LoginForm: Login successful, user:', user.name);
      
      // Dispatch custom event for App.jsx to detect
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      
      console.log('🔄 LoginForm: Navigating to dashboard...');
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      console.error('❌ LoginForm: Login failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1E293B] to-[#0B1120] flex items-center justify-center p-4">
      <div className="bg-[#0F172A] bg-opacity-90 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-400 mb-2">
          Login to UniPool 🚗
        </h1>
        
        <p className="text-center text-slate-400 text-sm mb-8">
          Welcome back! Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900 bg-opacity-20 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@formanite.fccollege.edu.pk"
              className="w-full px-4 py-3 rounded-full bg-[#1E293B] text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-400 transition duration-300"
              required
              autoComplete="username"
            />
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-full bg-[#1E293B] text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-400 transition duration-300"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-full transition-all duration-300 flex justify-center items-center shadow-lg disabled:opacity-70 text-lg font-semibold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : (
              'Login'
            )}
          </button>
          
          <div className="text-center text-sm text-slate-400 mt-8">
            <span>Don't have an account? </span>
            <button 
              type="button" 
              onClick={() => navigate('/signup')}
              className="text-cyan-400 hover:underline font-medium focus:outline-none"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;