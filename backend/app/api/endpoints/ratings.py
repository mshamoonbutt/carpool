from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.models.user import User
from app.models.rating import Rating, RatingCreate
from app.services.rating_service import RatingService
from app.services.ride_service import RideService
from app.services.booking_service import BookingService


router = APIRouter()


@router.post("/", response_model=Rating)
async def create_rating(
    rating_create: RatingCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new rating
    """
    # Set rater_id to current user
    rating_create.rater_id = current_user.id
    
    # Check if user can rate
    ride_service = RideService()
    booking_service = BookingService()
    
    ride = await ride_service.get_by_id(rating_create.ride_id)
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )
    
    # If rating a driver, check if user was a passenger
    if rating_create.rated_id == ride.driver_id:
        # Check if user was a passenger in the ride
        if current_user.id not in ride.passengers:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only rate drivers of rides you've taken",
            )
    
    # If rating a passenger, check if user was the driver
    elif current_user.id == ride.driver_id:
        # Check if rated user was a passenger
        if rating_create.rated_id not in ride.passengers:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only rate passengers from your rides",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid rating relationship",
        )
    
    # Validate rating score
    if rating_create.score < 1 or rating_create.score > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating score must be between 1 and 5",
        )
    
    # Create rating
    rating_service = RatingService()
    rating = await rating_service.create(rating_create)
    
    return rating


@router.get("/{rating_id}", response_model=Rating)
async def get_rating(
    rating_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get rating by ID
    """
    rating_service = RatingService()
    rating = await rating_service.get_by_id(rating_id)
    
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found",
        )
    
    return rating


@router.delete("/{rating_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rating(
    rating_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Delete rating
    """
    rating_service = RatingService()
    rating = await rating_service.get_by_id(rating_id)
    
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rating not found",
        )
    
    # Check if user is the rater
    if rating.rater_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own ratings",
        )
    
    # Delete rating
    await rating_service.delete(rating_id)


@router.get("/user/{user_id}", response_model=List[Rating])
async def get_user_ratings(
    user_id: str,
    role: str = "rated",  # "rated" or "rater"
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Get ratings for a user
    """
    rating_service = RatingService()
    ratings = await rating_service.get_user_ratings(
        user_id=user_id,
        role=role,
        skip=skip,
        limit=limit,
    )
    return ratings


@router.get("/ride/{ride_id}", response_model=List[Rating])
async def get_ride_ratings(
    ride_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Get ratings for a ride
    """
    rating_service = RatingService()
    ratings = await rating_service.get_ride_ratings(
        ride_id=ride_id,
        skip=skip,
        limit=limit,
    )
    return ratings


@router.get("/user/{user_id}/average", response_model=float)
async def get_user_average_rating(
    user_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get average rating for a user
    """
    rating_service = RatingService()
    average = await rating_service.get_average_rating(user_id)
    return average
