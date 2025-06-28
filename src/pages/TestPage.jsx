import React from 'react';
import { motion } from 'framer-motion';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          🎉 GUI Test Successful!
        </h1>
        
        <div className="space-y-4 text-white">
          <p className="text-lg">
            If you can see this page with proper styling, your GUI is working correctly!
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-500 p-4 rounded-lg">
              <p className="font-semibold">Blue Box</p>
            </div>
            <div className="bg-green-500 p-4 rounded-lg">
              <p className="font-semibold">Green Box</p>
            </div>
            <div className="bg-red-500 p-4 rounded-lg">
              <p className="font-semibold">Red Box</p>
            </div>
            <div className="bg-yellow-500 p-4 rounded-lg">
              <p className="font-semibold">Yellow Box</p>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
          >
            Go Back to Main Page
          </button>
        </div>
      </motion.div>
    </div>
  );
} 