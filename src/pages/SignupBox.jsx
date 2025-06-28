// src/pages/SignupBox.jsx

import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataService from '../services/DataService';

const SignupBox = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate email domain
      if (!email.endsWith('@formanite.fccollege.edu.pk')) {
        throw new Error('Only university emails allowed');
      }

      // Check if user already exists
      const existingUser = DataService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser = {
        id: `u${Date.now()}`,
        email,
        password,
        name,
        type: 'student',
        ratings: {
          driver: { average: 0, count: 0 },
          rider: { average: 0, count: 0 }
        }
      };

      DataService.addUser(newUser);
      
      setSuccess('Account created successfully! Redirecting...');
      
      // Store current user and redirect
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setTimeout(() => navigate('/dashboard'), 1000);
      
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
          Join UniPool 🚗
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-400 text-sm mb-8"
        >
          Create your account and start sharing rides
        </motion.p>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={`w-full px-4 py-3 rounded-full bg-[#1E293B] text-white placeholder-slate-500 focus:outline-none focus:ring-4 ${
                error ? 'focus:ring-red-500' : 'focus:ring-cyan-400'
              } transition duration-300`}
              required
              autoComplete="name"
            />
          </div>

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
              autoComplete="new-password"
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
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-full transition-all duration-300 flex justify-center items-center shadow-lg disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-slate-400 mt-6"
        >
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            className="text-cyan-400 hover:underline font-medium focus:outline-none"
          >
            Login here
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignupBox;
