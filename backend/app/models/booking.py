from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class BookingStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class BookingBase(BaseModel):
    ride_id: str
    passenger_id: str
    seats: int = 1
    
    class Config:
        arbitrary_types_allowed = True


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: BookingStatus
    seats: Optional[int] = None


class BookingInDB(BookingBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime
    status: BookingStatus = BookingStatus.PENDING
    
    class Config:
        populate_by_name = True


class Booking(BookingBase):
    id: str
    created_at: datetime
    updated_at: datetime
    status: BookingStatus
    
    @classmethod
    def from_db(cls, booking_db: BookingInDB) -> "Booking":
        return cls(
            id=str(booking_db.id),
            ride_id=booking_db.ride_id,
            passenger_id=booking_db.passenger_id,
            seats=booking_db.seats,
            created_at=booking_db.created_at,
            updated_at=booking_db.updated_at,
            status=booking_db.status,
        )
