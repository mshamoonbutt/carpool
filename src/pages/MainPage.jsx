import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MainPage() {
  const navigate = useNavigate();

  const quickLogin = () => {
    // Quick test login with student1
    const testUser = {
      id: 'student1',
      name: 'Student1',
      email: 'student1@formanite.fccollege.edu.pk',
      password: 'temp123',
      type: 'student',
      ratings: {
        rider: { average: 4.8, count: 15 },
        driver: { average: 4.9, count: 8 }
      }
    };
    
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/dashboard';
  };

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
        className="space-y-6 w-full max-w-sm"
      >
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-full shadow-lg transition transform hover:scale-105 text-lg font-semibold"
        >
          Sign In
        </button>

        <button 
          onClick={() => navigate('/signup')}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-full shadow-lg transition transform hover:scale-105 text-lg font-semibold"
        >
          Sign Up
        </button>

        <button 
          onClick={quickLogin}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105 text-sm"
        >
          🧪 Quick Test Login (Student1)
        </button>

        <button 
          onClick={() => {
            // Quick test login with student2
            const testUser = {
              id: 'student2',
              name: 'Student2',
              email: 'student2@formanite.fccollege.edu.pk',
              password: 'temp',
              type: 'student',
              ratings: {
                rider: { average: 4.7, count: 12 },
                driver: { average: 4.8, count: 10 }
              }
            };
            
            localStorage.setItem('currentUser', JSON.stringify(testUser));
            window.dispatchEvent(new Event('authChange'));
            window.location.href = '/dashboard';
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105 text-sm"
        >
          🧪 Quick Test Login (Student2)
        </button>

        <button 
          onClick={() => {
            localStorage.removeItem('currentUser');
            window.dispatchEvent(new Event('authChange'));
            window.location.reload();
          }}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105 text-sm"
        >
          🧹 Clear Auth & Reload
        </button>

        <button 
          onClick={() => {
            console.log('🔍 Debug: Checking current state...');
            console.log('Current user:', localStorage.getItem('currentUser'));
            console.log('Users:', localStorage.getItem('users'));
            console.log('Triggering auth check...');
            window.dispatchEvent(new Event('authChange'));
          }}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105 text-sm"
        >
          🔍 Debug Auth State
        </button>

        <button 
          onClick={async () => {
            console.log('🧪 Testing AuthService login...');
            try {
              const AuthService = (await import('../services/AuthService')).default;
              const user = await AuthService.login('student1@formanite.fccollege.edu.pk', 'temp123');
              console.log('✅ AuthService test successful:', user);
              alert('AuthService test successful! User: ' + user.name);
            } catch (error) {
              console.error('❌ AuthService test failed:', error);
              alert('AuthService test failed: ' + error.message);
            }
          }}
          className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105 text-sm"
        >
          🧪 Test AuthService
        </button>

        <button 
          onClick={() => navigate('/test')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 rounded-full shadow-lg transition transform hover:scale-105 text-sm"
        >
          🎨 Test GUI Styling
        </button>
      </motion.div>
    </div>
  );
}