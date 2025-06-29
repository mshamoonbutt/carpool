import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';

export default function LoginBox() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await AuthService.login(email, password);
      setSuccess('Login successful! Redirecting...');
      
      console.log('✅ Login successful, redirecting to dashboard...');
      
      // Get the intended destination from location state, or default to dashboard
      const from = location.state?.from || '/dashboard';
      
      // Use React Router navigation
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1E293B] to-[#0B1120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-[#0F172A] bg-opacity-90 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-400 mb-2"
        >
          UniPool 🚗
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-400 text-sm mb-8"
        >
          Smarter campus commuting. Share, save, connect.
        </motion.p>

        {/* Test Users Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800 p-4 rounded-lg mb-6 text-xs"
        >
          <p className="text-slate-300 mb-2 font-semibold">🧪 Test Users:</p>
          <div className="space-y-1 text-slate-400">
            <p><strong>Driver:</strong> ali.hassan@formanite.fccollege.edu.pk</p>
            <p><strong>Rider:</strong> sara.khan@formanite.fccollege.edu.pk</p>
            <p><strong>Both:</strong> ahmed.raza@formanite.fccollege.edu.pk</p>
            <p><strong>Driver 2:</strong> fatima.ali@formanite.fccollege.edu.pk</p>
            <p className="text-cyan-400 mt-2"><strong>Password:</strong> temp123</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@formanite.fccollege.edu.pk"
              className={`w-full px-4 py-3 rounded-full bg-[#1E293B] text-white placeholder-slate-500 focus:outline-none focus:ring-4 ${
                error ? 'focus:ring-red-500' : 'focus:ring-cyan-400'
              } transition duration-300`}
              required
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-full bg-[#1E293B] text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-cyan-400 transition duration-300"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}
          
          {success && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-sm text-center"
            >
              {success}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-full transition-all duration-300 flex justify-center items-center shadow-lg disabled:opacity-70 text-lg font-semibold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-slate-400 mt-8"
        >
          Don't have an account?{' '}
          <button 
            onClick={() => navigate('/signup')}
            className="text-cyan-400 hover:underline font-medium focus:outline-none"
          >
            Register here
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}