import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import RideCard from '../components/rides/RideCard'
import StatsCard from '../components/dashboard/StatsCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState({
    upcomingRides: 0,
    ridesOffered: 0,
    ridesCompleted: 0,
    rating: 0
  })
  
  const [upcomingRides, setUpcomingRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be a call to your API
        // For now, we'll simulate API responses with mock data
        
        // Fetch user stats
        // const statsResponse = await axios.get(`${API_URL}/users/me/stats`)
        
        // Mock stats data
        const mockStats = {
          upcomingRides: 2,
          ridesOffered: user?.userType === 'rider' ? 0 : 5,
          ridesCompleted: 12,
          rating: 4.7
        }
        
        setStats(mockStats)
        
        // Fetch upcoming rides
        // const ridesResponse = await axios.get(`${API_URL}/rides/upcoming`)
        
        // Mock upcoming rides data
        const mockUpcomingRides = [
          {
            id: 'r1',
            driver: {
              id: 'd1',
              name: 'Ahmed Khan',
              rating: 4.8
            },
            pickup: 'DHA Phase 5',
            dropoff: 'Punjab University',
            departureTime: '2025-06-28T08:00:00',
            arrivalTime: '2025-06-28T08:45:00',
            seats: {
              total: 3,
              available: 1
            },
            fare: 250,
            status: 'scheduled'
          },
          {
            id: 'r2',
            driver: {
              id: 'd2',
              name: 'Sara Ali',
              rating: 4.6
            },
            pickup: 'Johar Town',
            dropoff: 'UET Lahore',
            departureTime: '2025-06-29T09:15:00',
            arrivalTime: '2025-06-29T10:00:00',
            seats: {
              total: 4,
              available: 2
            },
            fare: 300,
            status: 'scheduled'
          }
        ]
        
        setUpcomingRides(mockUpcomingRides)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user])
  
  const handlePostRide = () => {
    navigate('/post')
  }
  
  const handleFindRide = () => {
    navigate('/rides')
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Upcoming Rides"
          value={stats.upcomingRides}
          icon="calendar"
          color="blue"
        />
        <StatsCard
          title={user?.userType === 'rider' ? "Rides Taken" : "Rides Offered"} 
          value={user?.userType === 'rider' ? stats.ridesCompleted : stats.ridesOffered}
          icon={user?.userType === 'rider' ? "user" : "car"}
          color="green"
        />
        <StatsCard
          title="Completed Rides"
          value={stats.ridesCompleted}
          icon="check-circle"
          color="purple"
        />
        <StatsCard
          title="Your Rating"
          value={stats.rating.toFixed(1)}
          icon="star"
          color="yellow"
          suffix="/5"
        />
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleFindRide}
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          Find a Ride
        </button>
        
        {(user?.userType === 'driver' || user?.userType === 'both') && (
          <button
            onClick={handlePostRide}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Offer a Ride
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Rides</h2>
          <button
            onClick={handleFindRide}
            className="text-primary hover:underline text-sm"
          >
            View all
          </button>
        </div>
        
        {upcomingRides.length === 0 ? (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <p className="mt-2 text-gray-500">No upcoming rides</p>
            <button
              onClick={handleFindRide}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Find a ride
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
