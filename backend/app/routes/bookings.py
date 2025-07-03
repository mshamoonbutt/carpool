from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.database_models import Booking, Ride, User
from app.models.schemas import BookingCreate, BookingResponse, BookingUpdate
from app.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=BookingResponse)
def create_booking(
    booking: BookingCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    # Get the ride
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )
    
    # Check if the user is not the driver
    if ride.driver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book your own ride"
        )
    
    # Check if enough seats are available
    if ride.available_seats < booking.seats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough seats available. Only {ride.available_seats} left."
        )
    
    # Check if ride is scheduled
    if ride.status != "scheduled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ride is no longer available for booking"
        )
    
    # Create booking
    db_booking = Booking(
        ride_id=booking.ride_id,
        passenger_id=current_user.id,
        seats=booking.seats,
        status="pending"  # Set the default status to pending
    )
    
    db.add(db_booking)
    
    # Update available seats
    ride.available_seats -= booking.seats
    
    db.commit()
    db.refresh(db_booking)
    
    # Return booking with relationships loaded
    result = db.query(Booking).options(
        joinedload(Booking.passenger),
        joinedload(Booking.ride).joinedload(Ride.driver)
    ).filter(Booking.id == db_booking.id).first()
    
    return result

@router.get("/", response_model=List[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get bookings where user is the passenger
    bookings = db.query(Booking).options(
        joinedload(Booking.passenger),
        joinedload(Booking.ride).joinedload(Ride.driver)
    ).filter(Booking.passenger_id == current_user.id).all()
    
    return bookings

@router.get("/as-driver", response_model=List[BookingResponse])
def get_bookings_as_driver(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get bookings for rides where user is the driver
    bookings = db.query(Booking).options(
        joinedload(Booking.passenger),
        joinedload(Booking.ride).joinedload(Ride.driver)
    ).join(Booking.ride).filter(Ride.driver_id == current_user.id).all()
    
    return bookings

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get the booking
    booking = db.query(Booking).options(
        joinedload(Booking.passenger),
        joinedload(Booking.ride).joinedload(Ride.driver)
    ).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if current user is related to the booking
    if booking.passenger_id != current_user.id and booking.ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return booking

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get the booking
    booking = db.query(Booking).options(
        joinedload(Booking.ride)
    ).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check permissions based on action
    is_driver = booking.ride.driver_id == current_user.id
    is_passenger = booking.passenger_id == current_user.id
    
    if booking_update.status in ["confirmed", "rejected"]:
        # Only driver can confirm/reject
        if not is_driver:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the driver can confirm or reject bookings"
            )
    elif booking_update.status == "cancelled":
        # Only passenger can cancel
        if not is_passenger:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the passenger can cancel their booking"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status update"
        )
    
    # Handle seat allocation if booking is cancelled or rejected
    if booking_update.status in ["cancelled", "rejected"] and booking.status not in ["cancelled", "rejected"]:
        # Return seats to the ride
        ride = booking.ride
        ride.available_seats += booking.seats
    
    # Update booking status
    booking.status = booking_update.status
    
    db.commit()
    db.refresh(booking)
    
    # Return booking with relationships loaded
    result = db.query(Booking).options(
        joinedload(Booking.passenger),
        joinedload(Booking.ride).joinedload(Ride.driver)
    ).filter(Booking.id == booking_id).first()
    
    return result

@router.put("/{booking_id}/approve", response_model=BookingResponse)
def approve_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approve a booking request (driver only)"""
    # Get the booking with relationships loaded
    booking = db.query(Booking).options(
        joinedload(Booking.ride)
    ).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if the current user is the driver of this ride
    ride = booking.ride
    if ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the ride driver can approve bookings"
        )
    
    # Check if booking is in a pending state
    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking is already {booking.status}"
        )
    
    # Update booking status
    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    
    # Return with relationships loaded
    result = db.query(Booking).options(
        joinedload(Booking.passenger),
        joinedload(Booking.ride).joinedload(Ride.driver)
    ).filter(Booking.id == booking_id).first()
    
    return result

@router.put("/{booking_id}/reject", response_model=BookingResponse)
def reject_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reject a booking request (driver only)"""
    # Get the booking with relationships loaded
    booking = db.query(Booking).options(
        joinedload(Booking.ride)
    ).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if the current user is the driver of this ride
    ride = booking.ride
    if ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the ride driver can reject bookings"
        )
    
    # Check if booking is in a pending state
    if booking.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking is already {booking.status}"
        )
    
    # Update booking status
    booking.status = "rejected"
    
    # Restore available seats in the ride
    ride.available_seats += booking.seats
    
    db.commit()
    db.refresh(booking)
    
    # Return with relationships loaded
    result = db.query(Booking).options(
        joinedload(Booking.passenger),
        joinedload(Booking.ride).joinedload(Ride.driver)
    ).filter(Booking.id == booking_id).first()
    
    return result
