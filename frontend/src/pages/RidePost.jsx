import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const RidePost = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    seats: 3,
    fare: 250,
    recurring: false,
    days: []
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const daysOfWeek = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' }
  ]
  
  const popularLocations = {
    pickups: ['DHA Phase 5', 'Gulberg', 'Johar Town', 'Model Town'],
    dropoffs: ['Punjab University', 'UET Lahore', 'LUMS', 'FAST-NUCES']
  }
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'recurring') {
      setFormData({
        ...formData,
        [name]: checked
      })
    } else if (name === 'days') {
      const dayValue = e.target.value
      let updatedDays
      
      if (formData.days.includes(dayValue)) {
        updatedDays = formData.days.filter(day => day !== dayValue)
      } else {
        updatedDays = [...formData.days, dayValue]
      }
      
      setFormData({
        ...formData,
        days: updatedDays
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      })
    }
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.pickup) {
      newErrors.pickup = 'Pickup location is required'
    }
    
    if (!formData.dropoff) {
      newErrors.dropoff = 'Dropoff location is required'
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past'
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required'
    }
    
    if (!formData.seats || formData.seats < 1) {
      newErrors.seats = 'Must have at least 1 seat available'
    }
    
    if (!formData.fare || formData.fare < 0) {
      newErrors.fare = 'Fare must be a positive number'
    }
    
    if (formData.recurring && formData.days.length === 0) {
      newErrors.days = 'Select at least one day for recurring rides'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    setLoading(true)
    
    try {
      // Prepare the ride data
      const rideData = {
        ...formData,
        driver: {
          id: user.id,
          name: user.name
        },
        departureTime: `${formData.date}T${formData.time}:00`,
        status: 'scheduled'
      }
      
      // In a real app, this would be an API call
      // await axios.post(`${API_URL}/rides`, rideData)
      
      // Simulate API call
      setTimeout(() => {
        toast.success('Ride posted successfully!')
        navigate('/')
      }, 1000)
    } catch (err) {
      console.error('Error posting ride:', err)
      toast.error('Failed to post ride')
    } finally {
      setLoading(false)
    }
  }
  
  // Check if user is allowed to post rides
  if (user?.userType === 'rider') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Not Authorized</h2>
          <p className="mt-2 text-gray-500">
            Your account is set to "Rider" mode. Only drivers can post rides.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Update Profile
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Offer a Ride
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location *
              </label>
              <input
                type="text"
                id="pickup"
                name="pickup"
                value={formData.pickup}
                onChange={handleChange}
                list="pickup-suggestions"
                className={`w-full px-3 py-2 border ${
                  errors.pickup ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="Enter pickup location"
              />
              <datalist id="pickup-suggestions">
                {popularLocations.pickups.map(location => (
                  <option key={location} value={location} />
                ))}
              </datalist>
              {errors.pickup && (
                <p className="mt-1 text-sm text-red-600">{errors.pickup}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700 mb-1">
                Dropoff Location *
              </label>
              <input
                type="text"
                id="dropoff"
                name="dropoff"
                value={formData.dropoff}
                onChange={handleChange}
                list="dropoff-suggestions"
                className={`w-full px-3 py-2 border ${
                  errors.dropoff ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="Enter dropoff location"
              />
              <datalist id="dropoff-suggestions">
                {popularLocations.dropoffs.map(location => (
                  <option key={location} value={location} />
                ))}
              </datalist>
              {errors.dropoff && (
                <p className="mt-1 text-sm text-red-600">{errors.dropoff}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Departure Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.time ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">
                Available Seats *
              </label>
              <input
                type="number"
                id="seats"
                name="seats"
                min="1"
                max="6"
                value={formData.seats}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.seats ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
              />
              {errors.seats && (
                <p className="mt-1 text-sm text-red-600">{errors.seats}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="fare" className="block text-sm font-medium text-gray-700 mb-1">
                Fare (PKR) *
              </label>
              <input
                type="number"
                id="fare"
                name="fare"
                min="0"
                step="10"
                value={formData.fare}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.fare ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
              />
              {errors.fare && (
                <p className="mt-1 text-sm text-red-600">{errors.fare}</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                This is a recurring ride
              </label>
            </div>
          </div>
          
          {formData.recurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring Days *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                {daysOfWeek.map(day => (
                  <div key={day.value} className="flex items-center">
                    <input
                      id={day.value}
                      name="days"
                      value={day.value}
                      type="checkbox"
                      checked={formData.days.includes(day.value)}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor={day.value} className="ml-2 block text-sm text-gray-700">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.days && (
                <p className="mt-1 text-sm text-red-600">{errors.days}</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 inline-block h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : 'Post Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RidePost
