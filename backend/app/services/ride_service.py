from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.core.database import get_database
from app.models.ride import RideCreate, RideInDB, Ride, RideUpdate, RideStatus


class RideService:
    """Service for ride operations."""
    
    async def create(self, ride_create: RideCreate) -> Ride:
        """Create a new ride."""
        db = await get_database()
        
        # Create ride dictionary
        now = datetime.utcnow()
        ride_dict = ride_create.model_dump()
        ride_dict.update({
            "_id": ObjectId(),
            "created_at": now,
            "updated_at": now,
            "status": RideStatus.PENDING,
            "passengers": [],
        })
        
        # Insert ride
        await db.carpool.rides.insert_one(ride_dict)
        
        # Add ride to user's rides_offered
        await db.carpool.users.update_one(
            {"_id": ObjectId(ride_create.driver_id)},
            {"$push": {"rides_offered": str(ride_dict["_id"])}}
        )
        
        # Return ride
        ride_in_db = RideInDB(**ride_dict)
        return Ride.from_db(ride_in_db)
    
    async def get_by_id(self, ride_id: str) -> Optional[Ride]:
        """Get a ride by ID."""
        db = await get_database()
        ride_data = await db.carpool.rides.find_one({"_id": ObjectId(ride_id)})
        
        if ride_data:
            ride_in_db = RideInDB(**ride_data)
            return Ride.from_db(ride_in_db)
        
        return None
    
    async def update(self, ride_id: str, ride_update: RideUpdate) -> Optional[Ride]:
        """Update a ride."""
        db = await get_database()
        
        # Get ride
        ride_data = await db.carpool.rides.find_one({"_id": ObjectId(ride_id)})
        if not ride_data:
            return None
        
        # Update ride
        update_data = ride_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await db.carpool.rides.update_one(
            {"_id": ObjectId(ride_id)},
            {"$set": update_data}
        )
        
        # Get updated ride
        updated_ride_data = await db.carpool.rides.find_one({"_id": ObjectId(ride_id)})
        ride_in_db = RideInDB(**updated_ride_data)
        return Ride.from_db(ride_in_db)
    
    async def delete(self, ride_id: str) -> bool:
        """Delete a ride."""
        db = await get_database()
        ride = await self.get_by_id(ride_id)
        
        if not ride:
            return False
        
        # Remove ride from user's rides_offered
        await db.carpool.users.update_one(
            {"_id": ObjectId(ride.driver_id)},
            {"$pull": {"rides_offered": ride_id}}
        )
        
        # Delete bookings for this ride
        await db.carpool.bookings.delete_many({"ride_id": ride_id})
        
        # Delete ride
        result = await db.carpool.rides.delete_one({"_id": ObjectId(ride_id)})
        return result.deleted_count > 0
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Ride]:
        """Get all rides."""
        db = await get_database()
        rides = []
        
        cursor = db.carpool.rides.find().skip(skip).limit(limit)
        async for ride_data in cursor:
            ride_in_db = RideInDB(**ride_data)
            rides.append(Ride.from_db(ride_in_db))
        
        return rides
    
    async def search_rides(
        self,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        date: Optional[datetime] = None,
        min_seats: Optional[int] = None,
        max_price: Optional[float] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Ride]:
        """Search rides by criteria."""
        db = await get_database()
        query = {"status": "pending"}
        
        if origin:
            query["origin"] = {"$regex": origin, "$options": "i"}
        
        if destination:
            query["destination"] = {"$regex": destination, "$options": "i"}
        
        if date:
            query["date"] = {"$gte": date.replace(hour=0, minute=0, second=0, microsecond=0)}
        
        if min_seats:
            query["seats_available"] = {"$gte": min_seats}
        
        if max_price:
            query["price"] = {"$lte": max_price}
        
        rides = []
        cursor = db.carpool.rides.find(query).skip(skip).limit(limit)
        async for ride_data in cursor:
            ride_in_db = RideInDB(**ride_data)
            rides.append(Ride.from_db(ride_in_db))
        
        return rides
    
    async def get_user_rides(
        self,
        user_id: str,
        role: str = "driver",  # "driver" or "passenger"
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Ride]:
        """Get rides for a user."""
        db = await get_database()
        query = {}
        
        if role == "driver":
            query["driver_id"] = user_id
        elif role == "passenger":
            query["passengers"] = user_id
        
        if status:
            query["status"] = status
        
        rides = []
        cursor = db.carpool.rides.find(query).skip(skip).limit(limit)
        async for ride_data in cursor:
            ride_in_db = RideInDB(**ride_data)
            rides.append(Ride.from_db(ride_in_db))
        
        return rides
