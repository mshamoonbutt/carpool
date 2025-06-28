from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.security import get_current_user
from app.models.user import User
from app.models.booking import Booking, BookingCreate, BookingUpdate, BookingStatus
from app.services.booking_service import BookingService
from app.services.ride_service import RideService


router = APIRouter()


@router.post("/", response_model=Booking)
async def create_booking(
    booking_create: BookingCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new booking
    """
    # Set passenger ID to current user
    booking_create.passenger_id = current_user.id
    
    # Create booking
    booking_service = BookingService()
    
    try:
        booking = await booking_service.create(booking_create)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    return booking


@router.get("/{booking_id}", response_model=Booking)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get booking by ID
    """
    booking_service = BookingService()
    booking = await booking_service.get_by_id(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Check if user is related to the booking
    ride_service = RideService()
    ride = await ride_service.get_by_id(booking.ride_id)
    
    if booking.passenger_id != current_user.id and ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own bookings",
        )
    
    return booking


@router.put("/{booking_id}/status", response_model=Booking)
async def update_booking_status(
    booking_id: str,
    booking_update: BookingUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update booking status
    """
    booking_service = BookingService()
    booking = await booking_service.get_by_id(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Check if user is related to the booking
    ride_service = RideService()
    ride = await ride_service.get_by_id(booking.ride_id)
    
    # Passenger can cancel, driver can accept/reject
    is_passenger = booking.passenger_id == current_user.id
    is_driver = ride.driver_id == current_user.id
    
    if not (is_passenger or is_driver):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this booking",
        )
    
    # Passenger can only cancel
    if is_passenger and booking_update.status != BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Passengers can only cancel bookings",
        )
    
    # Driver can only accept/reject
    if is_driver and booking_update.status not in [BookingStatus.ACCEPTED, BookingStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Drivers can only accept or reject bookings",
        )
    
    # Update booking
    updated_booking = await booking_service.update_status(booking_id, booking_update)
    return updated_booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Delete booking
    """
    booking_service = BookingService()
    booking = await booking_service.get_by_id(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Check if user is the passenger
    if booking.passenger_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own bookings",
        )
    
    # Delete booking
    await booking_service.delete(booking_id)


@router.get("/user/{user_id}", response_model=List[Booking])
async def get_user_bookings(
    user_id: str,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Get bookings for a user
    """
    # Check if user is requesting their own bookings
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own bookings",
        )
    
    booking_service = BookingService()
    bookings = await booking_service.get_user_bookings(
        user_id=user_id,
        status=status,
        skip=skip,
        limit=limit,
    )
    return bookings


@router.get("/ride/{ride_id}", response_model=List[Booking])
async def get_ride_bookings(
    ride_id: str,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Get bookings for a ride
    """
    # Check if user is the ride driver
    ride_service = RideService()
    ride = await ride_service.get_by_id(ride_id)
    
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )
    
    if ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access bookings for your own rides",
        )
    
    booking_service = BookingService()
    bookings = await booking_service.get_ride_bookings(
        ride_id=ride_id,
        status=status,
        skip=skip,
        limit=limit,
    )
    return bookings
