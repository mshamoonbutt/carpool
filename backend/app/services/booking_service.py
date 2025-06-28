from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.core.database import get_database
from app.models.booking import BookingCreate, BookingInDB, Booking, BookingUpdate, BookingStatus
from app.services.ride_service import RideService


class BookingService:
    """Service for booking operations."""
    
    async def create(self, booking_create: BookingCreate) -> Booking:
        """Create a new booking."""
        db = await get_database()
        
        # Check if ride exists and has available seats
        ride_service = RideService()
        ride = await ride_service.get_by_id(booking_create.ride_id)
        
        if not ride:
            raise ValueError("Ride not found")
        
        if ride.seats_available < booking_create.seats:
            raise ValueError("Not enough seats available")
        
        # Create booking dictionary
        now = datetime.utcnow()
        booking_dict = booking_create.model_dump()
        booking_dict.update({
            "_id": ObjectId(),
            "created_at": now,
            "updated_at": now,
            "status": BookingStatus.PENDING,
        })
        
        # Insert booking
        await db.carpool.bookings.insert_one(booking_dict)
        
        # Add booking to user's bookings
        await db.carpool.users.update_one(
            {"_id": ObjectId(booking_create.passenger_id)},
            {"$push": {"rides_taken": str(booking_dict["_id"])}}
        )
        
        # Return booking
        booking_in_db = BookingInDB(**booking_dict)
        return Booking.from_db(booking_in_db)
    
    async def get_by_id(self, booking_id: str) -> Optional[Booking]:
        """Get a booking by ID."""
        db = await get_database()
        booking_data = await db.carpool.bookings.find_one({"_id": ObjectId(booking_id)})
        
        if booking_data:
            booking_in_db = BookingInDB(**booking_data)
            return Booking.from_db(booking_in_db)
        
        return None
    
    async def update_status(self, booking_id: str, booking_update: BookingUpdate) -> Optional[Booking]:
        """Update booking status."""
        db = await get_database()
        
        # Get booking
        booking = await self.get_by_id(booking_id)
        if not booking:
            return None
        
        # Update booking
        update_data = booking_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await db.carpool.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_data}
        )
        
        # If booking is accepted, update ride
        if booking_update.status == BookingStatus.ACCEPTED:
            # Update ride seats and passengers
            await db.carpool.rides.update_one(
                {"_id": ObjectId(booking.ride_id)},
                {
                    "$inc": {"seats_available": -booking.seats},
                    "$push": {"passengers": booking.passenger_id},
                }
            )
        
        # If booking is cancelled/rejected and was previously accepted, restore seats
        elif booking_update.status in [BookingStatus.CANCELLED, BookingStatus.REJECTED] and booking.status == BookingStatus.ACCEPTED:
            # Update ride seats and passengers
            await db.carpool.rides.update_one(
                {"_id": ObjectId(booking.ride_id)},
                {
                    "$inc": {"seats_available": booking.seats},
                    "$pull": {"passengers": booking.passenger_id},
                }
            )
        
        # Get updated booking
        updated_booking_data = await db.carpool.bookings.find_one({"_id": ObjectId(booking_id)})
        booking_in_db = BookingInDB(**updated_booking_data)
        return Booking.from_db(booking_in_db)
    
    async def delete(self, booking_id: str) -> bool:
        """Delete a booking."""
        db = await get_database()
        
        # Get booking
        booking = await self.get_by_id(booking_id)
        if not booking:
            return False
        
        # If booking is accepted, restore ride seats and remove passenger
        if booking.status == BookingStatus.ACCEPTED:
            await db.carpool.rides.update_one(
                {"_id": ObjectId(booking.ride_id)},
                {
                    "$inc": {"seats_available": booking.seats},
                    "$pull": {"passengers": booking.passenger_id},
                }
            )
        
        # Remove booking from user's rides_taken
        await db.carpool.users.update_one(
            {"_id": ObjectId(booking.passenger_id)},
            {"$pull": {"rides_taken": booking_id}}
        )
        
        # Delete booking
        result = await db.carpool.bookings.delete_one({"_id": ObjectId(booking_id)})
        return result.deleted_count > 0
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Booking]:
        """Get all bookings."""
        db = await get_database()
        bookings = []
        
        cursor = db.carpool.bookings.find().skip(skip).limit(limit)
        async for booking_data in cursor:
            booking_in_db = BookingInDB(**booking_data)
            bookings.append(Booking.from_db(booking_in_db))
        
        return bookings
    
    async def get_user_bookings(
        self,
        user_id: str,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Booking]:
        """Get bookings for a user."""
        db = await get_database()
        query = {"passenger_id": user_id}
        
        if status:
            query["status"] = status
        
        bookings = []
        cursor = db.carpool.bookings.find(query).skip(skip).limit(limit)
        async for booking_data in cursor:
            booking_in_db = BookingInDB(**booking_data)
            bookings.append(Booking.from_db(booking_in_db))
        
        return bookings
    
    async def get_ride_bookings(
        self,
        ride_id: str,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Booking]:
        """Get bookings for a ride."""
        db = await get_database()
        query = {"ride_id": ride_id}
        
        if status:
            query["status"] = status
        
        bookings = []
        cursor = db.carpool.bookings.find(query).skip(skip).limit(limit)
        async for booking_data in cursor:
            booking_in_db = BookingInDB(**booking_data)
            bookings.append(Booking.from_db(booking_in_db))
        
        return bookings
