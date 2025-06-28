from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

# Ride schemas
class RideBase(BaseModel):
    origin: str
    destination: str
    departure_time: datetime
    available_seats: int
    price: float
    description: Optional[str] = None

class RideCreate(RideBase):
    pass

class RideUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    departure_time: Optional[datetime] = None
    available_seats: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None

class RideResponse(RideBase):
    id: int
    driver_id: int
    status: str
    created_at: datetime
    driver: UserResponse

    class Config:
        orm_mode = True

# Booking schemas
class BookingBase(BaseModel):
    ride_id: int
    seats: int = 1

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    status: str

class BookingResponse(BookingBase):
    id: int
    passenger_id: int
    status: str
    created_at: datetime
    passenger: UserResponse
    ride: RideResponse

    class Config:
        orm_mode = True

# Rating schemas
class RatingBase(BaseModel):
    rated_id: int
    ride_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class RatingCreate(RatingBase):
    pass

class RatingResponse(RatingBase):
    id: int
    rater_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
