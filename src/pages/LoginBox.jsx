import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginBox() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.endsWith('@formanite.fccollege.edu.pk')) {
      setError('Error! wrong domain.');
      setSuccess('');
      return;
    }

    if (password.length < 6) {
      setError('Weak password. Try again.');
      setSuccess('');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    setTimeout(() => {
      setLoading(false);
      setSuccess('Login successful! Redirecting...');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1E293B] to-[#0B1120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-[#0F172A] bg-opacity-90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-extrabold text-center text-cyan-400 mb-2"
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
            />
            <button
              type="button"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-cyan-400"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-full transition-all duration-300 flex justify-center items-center shadow-lg"
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
          className="text-center text-sm text-slate-400 mt-6"
        >
          Don’t have an account?{' '}
          <a href="#" className="text-cyan-400 hover:underline font-medium">
            Register here
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
