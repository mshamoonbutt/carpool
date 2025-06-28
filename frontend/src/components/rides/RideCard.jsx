import React from 'react'
import { useNavigate } from 'react-router-dom'
import RatingStars from '../common/RatingStars'

const RideCard = ({ ride, showActions = false }) => {
  const navigate = useNavigate()
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const handleViewDetails = () => {
    // Navigate to ride details page
    // navigate(`/rides/${ride.id}`)
    console.log('View details for ride', ride.id)
  }
  
  const handleBookRide = () => {
    // Open booking modal or navigate to booking page
    console.log('Book ride', ride.id)
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white font-medium">
                {ride.driver.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="font-medium">{ride.driver.name}</p>
                <div className="flex items-center">
                  <RatingStars rating={ride.driver.rating} />
                  <span className="ml-1 text-sm text-gray-500">{ride.driver.rating}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-gray-500 text-sm">{formatDate(ride.departureTime)}</p>
            <p className="font-semibold text-primary">
              Rs. {ride.fare}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex">
            <div className="flex flex-col items-center mr-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-0.5 h-14 bg-gray-300"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-xs text-gray-500">PICKUP - {formatTime(ride.departureTime)}</p>
                <p className="font-medium">{ride.pickup}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">DROPOFF - {formatTime(ride.arrivalTime)}</p>
                <p className="font-medium">{ride.dropoff}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            {ride.seats.available} seat{ride.seats.available !== 1 ? 's' : ''} available
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={handleViewDetails}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50"
              >
                Details
              </button>
              
              {ride.seats.available > 0 && (
                <button
                  onClick={handleBookRide}
                  className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark"
                >
                  Book
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RideCard
