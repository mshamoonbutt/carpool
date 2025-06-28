import React from 'react'

const RatingStars = ({ rating, size = 'small' }) => {
  // Round to nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2
  
  // Create array of 5 stars
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1
    const isFullStar = starValue <= roundedRating
    const isHalfStar = !isFullStar && starValue - 0.5 <= roundedRating
    
    return { isFullStar, isHalfStar }
  })
  
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  }
  
  return (
    <div className="flex">
      {stars.map((star, index) => (
        <span key={index} className="text-yellow-400">
          {star.isFullStar ? (
            // Full star
            <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : star.isHalfStar ? (
            // Half star
            <svg className={sizeClasses[size]} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <defs />
              <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" fillRule="evenodd" />
              <path fill="#fff" d="M10 6.5v7.5-7.5zm0 7.5L7.5 16l.75-4.25-3-3 4.125-.6L10 4.5v9.5z" clipRule="evenodd" fillRule="evenodd" />
            </svg>
          ) : (
            // Empty star
            <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </span>
      ))}
    </div>
  )
}

export default RatingStars
