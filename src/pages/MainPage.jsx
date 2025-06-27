import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1E293B] to-[#0B1120] flex flex-col items-center justify-center text-center p-6">
      <motion.h1 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold text-cyan-400 mb-4"
      >
        UniPool 🚗
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 mb-8"
      >
        Your smarter way to commute on campus.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 w-full max-w-sm"
      >
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105"
        >
          Sign In
        </button>

        <button 
          onClick={() => navigate('/signup')}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105"
        >
          Sign Up
        </button>
      </motion.div>
    </div>
  );
}
