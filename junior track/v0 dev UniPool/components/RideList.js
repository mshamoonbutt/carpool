// components/RideList.js
'use client';

import React, { useState, useEffect } from 'react';
import { usePolling } from '@/hooks/usePolling';
import DataService from '@/services/DataService';

export default function RideList({ 
  filters = {}, 
  showSearchForm = false,
  onFiltersChange = null 
}) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [searchFilters, setSearchFilters] = useState({
    pickup: '',
    destination: 'FCC', // Default to FCC
    date: new Date().toISOString().split('T')[0], // Today's date
    timeFlexibility: '30'
  });

  // Get current user (you'll need to implement this based on your auth system)
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  // Fetch rides function for polling
  const fetchRides = async () => {
    try {
      setLoading(true);
      
      // Use filters prop or searchFilters
      const activeFilters = Object.keys(filters).length > 0 ? filters : searchFilters;
      
      // Get all rides from DataService
      const allRides = DataService.getRides(activeFilters);
      
      // Filter out rides created by current user (they shouldn't book their own rides)
      const availableRides = allRides.filter(ride => 
        ride.driverId !== currentUser?.id && ride.availableSeats > 0
      );
      
      setRides(availableRides);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup polling with 5-second interval
  const { refresh } = usePolling(fetchRides, 5000, true);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchRides();
  }, [filters, searchFilters]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
    if (onFiltersChange) {
      onFiltersChange(searchFilters);
    }
  };

  // Handle booking a ride
  const handleBookRide = async (ride) => {
    if (!currentUser) {
      alert('Please log in to book a ride');
      return;
    }

    if (currentUser.id === ride.driverId) {
      alert('You cannot book your own ride');
      return;
    }

    try {
      const pickupPoint = prompt('Enter your pickup point along the route:');
      if (!pickupPoint) return;

      await DataService.bookRide(ride.id, {
        riderId: currentUser.id,
        riderName: currentUser.name,
        pickupPoint
      });

      alert('Ride booked successfully!');
      // Refresh will happen automatically via polling
    } catch (error) {
      alert(`Failed to book ride: ${error.message}`);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Search Form (if enabled) */}
      {showSearchForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Search Rides</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pickup Area</label>
              <select
                value={searchFilters.pickup}
                onChange={(e) => setSearchFilters({...searchFilters, pickup: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Any area</option>
                <option value="DHA Phase 5">DHA Phase 5</option>
                <option value="DHA Phase 4">DHA Phase 4</option>
                <option value="Gulberg">Gulberg</option>
                <option value="Model Town">Model Town</option>
                <option value="Johar Town">Johar Town</option>
                <option value="Liberty">Liberty</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Destination</label>
              <select
                value={searchFilters.destination}
                onChange={(e) => setSearchFilters({...searchFilters, destination: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="FCC">Forman Christian College</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={searchFilters.date}
                onChange={(e) => setSearchFilters({...searchFilters, date: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Time Flexibility</label>
              <select
                value={searchFilters.timeFlexibility}
                onChange={(e) => setSearchFilters({...searchFilters, timeFlexibility: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="15">±15 minutes</option>
                <option value="30">±30 minutes</option>
                <option value="60">±60 minutes</option>
              </select>
            </div>
            
            <div className="md:col-span-4">
              <button 
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Rides'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Real-time status header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {showSearchForm ? 'Search Results' : 'Available Rides'}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live • {lastUpdate.toLocaleTimeString()}</span>
          <button 
            onClick={refresh}
            disabled={loading}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && rides.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading rides...</p>
          </div>
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 mb-2">No rides found matching your criteria</p>
          <p className="text-sm text-gray-500">Try adjusting your search filters or check back later</p>
        </div>
      ) : (
        /* Rides List */
        <div className="space-y-4">
          {rides.map((ride) => (
            <div key={ride.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    📍 {ride.pickup} → {ride.dropoff}
                  </h3>
                  <p className="text-sm text-gray-600">
                    🕒 {formatDateTime(ride.departureTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    👤 Driver: {ride.driverName} • 🪑 {ride.availableSeats} seats available
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    ride.availableSeats > 2 ? 'bg-green-500' : 
                    ride.availableSeats > 0 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs font-medium">
                    {ride.availableSeats > 0 ? 'Available' : 'Full'}
                  </span>
                </div>
              </div>

              {/* Route information */}
              {ride.route && ride.route.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Route:</p>
                  <div className="flex flex-wrap gap-2">
                    {ride.route.map((point, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current bookings (for transparency) */}
              {ride.bookings && ride.bookings.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Current Bookings ({ride.bookings.length}/{ride.seats}):
                  </p>
                  <div className="space-y-1">
                    {ride.bookings.map((booking, index) => (
                      <div key={index} className="text-xs bg-white px-2 py-1 rounded border">
                        {booking.riderName} at {booking.pickupPoint}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recurring ride info */}
              {ride.recurring && ride.recurring.enabled && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  🔄 Recurring ride: {ride.recurring.days.join(', ')}
                </div>
              )}

              {/* Action button */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created: {new Date(ride.createdAt).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => handleBookRide(ride)}
                  disabled={ride.availableSeats === 0 || !currentUser}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    ride.availableSeats === 0 || !currentUser
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {!currentUser ? 'Login to Book' : 
                   ride.availableSeats === 0 ? 'Fully Booked' : 'Book Ride'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-refresh status footer */}
      {rides.length > 0 && (
        <div className="text-center text-xs text-gray-500 p-4 border-t">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live updates every 5 seconds • Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}