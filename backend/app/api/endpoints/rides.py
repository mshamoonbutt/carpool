from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime

from app.core.security import get_current_user
from app.models.user import User
from app.models.ride import Ride, RideCreate, RideUpdate, RideStatus
from app.services.ride_service import RideService


router = APIRouter()


@router.post("/", response_model=Ride)
async def create_ride(
    ride_create: RideCreate,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new ride
    """
    # Check if user is allowed to create a ride
    if current_user.role not in ["driver", "both"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can create rides",
        )
    
    # Set driver ID to current user
    ride_create.driver_id = current_user.id
    
    # Create ride
    ride_service = RideService()
    ride = await ride_service.create(ride_create)
    
    return ride


@router.get("/{ride_id}", response_model=Ride)
async def get_ride(
    ride_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get ride by ID
    """
    ride_service = RideService()
    ride = await ride_service.get_by_id(ride_id)
    
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )
    
    return ride


@router.put("/{ride_id}", response_model=Ride)
async def update_ride(
    ride_id: str,
    ride_update: RideUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update ride
    """
    ride_service = RideService()
    ride = await ride_service.get_by_id(ride_id)
    
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )
    
    # Check if user is the ride driver
    if ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own rides",
        )
    
    # Update ride
    updated_ride = await ride_service.update(ride_id, ride_update)
    return updated_ride


@router.delete("/{ride_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ride(
    ride_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Delete ride
    """
    ride_service = RideService()
    ride = await ride_service.get_by_id(ride_id)
    
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )
    
    # Check if user is the ride driver
    if ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own rides",
        )
    
    # Delete ride
    await ride_service.delete(ride_id)


@router.get("/", response_model=List[Ride])
async def get_rides(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Get all rides
    """
    ride_service = RideService()
    rides = await ride_service.get_all(skip=skip, limit=limit)
    return rides


@router.get("/search/", response_model=List[Ride])
async def search_rides(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    date: Optional[datetime] = None,
    min_seats: Optional[int] = Query(None, gt=0),
    max_price: Optional[float] = Query(None, gt=0),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Search rides by criteria
    """
    ride_service = RideService()
    rides = await ride_service.search_rides(
        origin=origin,
        destination=destination,
        date=date,
        min_seats=min_seats,
        max_price=max_price,
        skip=skip,
        limit=limit,
    )
    return rides


@router.get("/user/{user_id}", response_model=List[Ride])
async def get_user_rides(
    user_id: str,
    role: str = Query("driver", regex="^(driver|passenger)$"),
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Get rides for a user
    """
    ride_service = RideService()
    rides = await ride_service.get_user_rides(
        user_id=user_id,
        role=role,
        status=status,
        skip=skip,
        limit=limit,
    )
    return rides
