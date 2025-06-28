from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.database_models import Ride, User
from app.models.schemas import RideCreate, RideResponse, RideUpdate
from app.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=RideResponse)
def create_ride(
    ride: RideCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    # Check if user is a driver or both
    if current_user.role not in ["driver", "both"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can create rides"
        )
        
    db_ride = Ride(
        driver_id=current_user.id,
        origin=ride.origin,
        destination=ride.destination,
        departure_time=ride.departure_time,
        available_seats=ride.available_seats,
        price=ride.price,
        description=ride.description
    )
    
    db.add(db_ride)
    db.commit()
    db.refresh(db_ride)
    
    # Load the ride with driver information
    result = db.query(Ride).options(joinedload(Ride.driver)).filter(Ride.id == db_ride.id).first()
    
    return result

@router.get("/", response_model=List[RideResponse])
def get_rides(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    rides = db.query(Ride).options(joinedload(Ride.driver)).offset(skip).limit(limit).all()
    return rides

@router.get("/search", response_model=List[RideResponse])
def search_rides(
    origin: str = None,
    destination: str = None,
    min_date: str = None,
    max_date: str = None,
    max_price: float = None,
    min_seats: int = 1,
    db: Session = Depends(get_db)
):
    query = db.query(Ride).options(joinedload(Ride.driver))
    
    if origin:
        query = query.filter(Ride.origin.ilike(f"%{origin}%"))
    if destination:
        query = query.filter(Ride.destination.ilike(f"%{destination}%"))
    if min_date:
        query = query.filter(Ride.departure_time >= min_date)
    if max_date:
        query = query.filter(Ride.departure_time <= max_date)
    if max_price:
        query = query.filter(Ride.price <= max_price)
    if min_seats:
        query = query.filter(Ride.available_seats >= min_seats)
    
    # Only return scheduled rides
    query = query.filter(Ride.status == "scheduled")
    
    rides = query.all()
    return rides

@router.get("/{ride_id}", response_model=RideResponse)
def get_ride(
    ride_id: int,
    db: Session = Depends(get_db)
):
    ride = db.query(Ride).options(joinedload(Ride.driver)).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )
    return ride

@router.put("/{ride_id}", response_model=RideResponse)
def update_ride(
    ride_id: int,
    ride_update: RideUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get the ride
    db_ride = db.query(Ride).filter(Ride.id == ride_id).first()
    
    if not db_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )
    
    # Check if current user is the driver of the ride
    if db_ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the ride creator can update this ride"
        )
    
    # Update fields if provided
    update_data = ride_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ride, key, value)
    
    db.commit()
    db.refresh(db_ride)
    
    # Load the ride with driver information
    result = db.query(Ride).options(joinedload(Ride.driver)).filter(Ride.id == ride_id).first()
    
    return result

@router.delete("/{ride_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ride(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get the ride
    db_ride = db.query(Ride).filter(Ride.id == ride_id).first()
    
    if not db_ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found"
        )
    
    # Check if current user is the driver of the ride
    if db_ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the ride creator can delete this ride"
        )
    
    # Set ride status to cancelled
    db_ride.status = "cancelled"
    db.commit()
    
    return None
