from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)
    role = Column(String)  # driver, rider, both
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    rides_offered = relationship("Ride", back_populates="driver")
    bookings = relationship("Booking", back_populates="passenger")
    ratings_given = relationship("Rating", foreign_keys="Rating.rater_id", back_populates="rater")
    ratings_received = relationship("Rating", foreign_keys="Rating.rated_id", back_populates="rated")


class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.id"))
    origin = Column(String)
    destination = Column(String)
    departure_time = Column(DateTime)
    available_seats = Column(Integer)
    price = Column(Float)
    description = Column(Text, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, in_progress, completed, cancelled
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    driver = relationship("User", back_populates="rides_offered")
    bookings = relationship("Booking", back_populates="ride")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id"))
    passenger_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # pending, confirmed, cancelled, completed
    seats = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    ride = relationship("Ride", back_populates="bookings")
    passenger = relationship("User", back_populates="bookings")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    rater_id = Column(Integer, ForeignKey("users.id"))
    rated_id = Column(Integer, ForeignKey("users.id"))
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=True)
    rating = Column(Integer)  # 1-5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    rater = relationship("User", foreign_keys=[rater_id], back_populates="ratings_given")
    rated = relationship("User", foreign_keys=[rated_id], back_populates="ratings_received")
    ride = relationship("Ride")
