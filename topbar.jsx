import React from 'react';

export default function Topbar() {
  return (
    <div className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">UniPool 🚗</h1>
        <div className="space-x-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Login
          </button>
          <button className="bg-white border text-blue-500 border-blue-500 px-4 py-2 rounded-md hover:bg-blue-50">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
