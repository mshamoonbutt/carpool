import React, { useState, useEffect } from 'react'
import axios from 'axios'
import RideCard from '../components/rides/RideCard'
import { toast } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const RideSearch = () => {
  const [searchParams, setSearchParams] = useState({
    pickup: '',
    dropoff: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00'
  })
  
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  
  const popularLocations = {
    pickups: ['DHA Phase 5', 'Gulberg', 'Johar Town', 'Model Town'],
    dropoffs: ['Punjab University', 'UET Lahore', 'LUMS', 'FAST-NUCES']
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setSearchParams({
      ...searchParams,
      [name]: value
    })
  }
  
  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchParams.pickup || !searchParams.dropoff) {
      toast.error('Please enter pickup and dropoff locations')
      return
    }
    
    setLoading(true)
    
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`${API_URL}/rides/search`, { params: searchParams })
      
      // Mock data for now
      setTimeout(() => {
        const mockRides = [
          {
            id: 'r1',
            driver: {
              id: 'd1',
              name: 'Ahmed Khan',
              rating: 4.8
            },
            pickup: searchParams.pickup,
            dropoff: searchParams.dropoff,
            departureTime: `${searchParams.date}T${searchParams.time}:00`,
            arrivalTime: `${searchParams.date}T${searchParams.time}:45:00`,
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
            pickup: searchParams.pickup,
            dropoff: searchParams.dropoff,
            departureTime: `${searchParams.date}T${
              (parseInt(searchParams.time.split(':')[0]) + 1).toString().padStart(2, '0')
            }:${searchParams.time.split(':')[1]}:00`,
            arrivalTime: `${searchParams.date}T${
              (parseInt(searchParams.time.split(':')[0]) + 1).toString().padStart(2, '0')
            }:45:00`,
            seats: {
              total: 4,
              available: 2
            },
            fare: 300,
            status: 'scheduled'
          }
        ]
        
        setRides(mockRides)
        setLoading(false)
        setSearched(true)
      }, 1000)
    } catch (err) {
      console.error('Error searching for rides:', err)
      toast.error('Failed to search for rides')
      setLoading(false)
    }
  }
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Find a Ride
        </h1>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location
            </label>
            <input
              type="text"
              id="pickup"
              name="pickup"
              value={searchParams.pickup}
              onChange={handleChange}
              list="pickup-suggestions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter pickup location"
            />
            <datalist id="pickup-suggestions">
              {popularLocations.pickups.map(location => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700 mb-1">
              Dropoff Location
            </label>
            <input
              type="text"
              id="dropoff"
              name="dropoff"
              value={searchParams.dropoff}
              onChange={handleChange}
              list="dropoff-suggestions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter dropoff location"
            />
            <datalist id="dropoff-suggestions">
              {popularLocations.dropoffs.map(location => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={searchParams.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={searchParams.time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full lg:w-auto px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center justify-center transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {searched && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {rides.length > 0 ? `Available Rides (${rides.length})` : 'No Rides Found'}
          </h2>
          
          {rides.length === 0 ? (
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="mt-2 text-gray-500">No rides found for your search criteria</p>
              <p className="text-sm text-gray-500 mt-1">Try different locations or time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RideSearch
