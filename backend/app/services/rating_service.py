from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.core.database import get_database
from app.models.rating import RatingCreate, RatingInDB, Rating


class RatingService:
    """Service for rating operations."""
    
    async def create(self, rating_create: RatingCreate) -> Rating:
        """Create a new rating."""
        db = await get_database()
        
        # Create rating dictionary
        now = datetime.utcnow()
        rating_dict = rating_create.model_dump()
        rating_dict.update({
            "_id": ObjectId(),
            "created_at": now,
        })
        
        # Insert rating
        await db.carpool.ratings.insert_one(rating_dict)
        
        # Add rating to user's ratings
        await db.carpool.users.update_one(
            {"_id": ObjectId(rating_create.rated_id)},
            {"$push": {"ratings": {"id": str(rating_dict["_id"]), "score": rating_create.score}}}
        )
        
        # Return rating
        rating_in_db = RatingInDB(**rating_dict)
        return Rating.from_db(rating_in_db)
    
    async def get_by_id(self, rating_id: str) -> Optional[Rating]:
        """Get a rating by ID."""
        db = await get_database()
        rating_data = await db.carpool.ratings.find_one({"_id": ObjectId(rating_id)})
        
        if rating_data:
            rating_in_db = RatingInDB(**rating_data)
            return Rating.from_db(rating_in_db)
        
        return None
    
    async def delete(self, rating_id: str) -> bool:
        """Delete a rating."""
        db = await get_database()
        
        # Get rating
        rating = await self.get_by_id(rating_id)
        if not rating:
            return False
        
        # Remove rating from user's ratings
        await db.carpool.users.update_one(
            {"_id": ObjectId(rating.rated_id)},
            {"$pull": {"ratings": {"id": rating_id}}}
        )
        
        # Delete rating
        result = await db.carpool.ratings.delete_one({"_id": ObjectId(rating_id)})
        return result.deleted_count > 0
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Rating]:
        """Get all ratings."""
        db = await get_database()
        ratings = []
        
        cursor = db.carpool.ratings.find().skip(skip).limit(limit)
        async for rating_data in cursor:
            rating_in_db = RatingInDB(**rating_data)
            ratings.append(Rating.from_db(rating_in_db))
        
        return ratings
    
    async def get_user_ratings(
        self,
        user_id: str,
        role: str = "rated",  # "rated" or "rater"
        skip: int = 0,
        limit: int = 100,
    ) -> List[Rating]:
        """Get ratings for a user."""
        db = await get_database()
        
        field_name = f"{role}_id"
        query = {field_name: user_id}
        
        ratings = []
        cursor = db.carpool.ratings.find(query).skip(skip).limit(limit)
        async for rating_data in cursor:
            rating_in_db = RatingInDB(**rating_data)
            ratings.append(Rating.from_db(rating_in_db))
        
        return ratings
    
    async def get_ride_ratings(
        self,
        ride_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Rating]:
        """Get ratings for a ride."""
        db = await get_database()
        query = {"ride_id": ride_id}
        
        ratings = []
        cursor = db.carpool.ratings.find(query).skip(skip).limit(limit)
        async for rating_data in cursor:
            rating_in_db = RatingInDB(**rating_data)
            ratings.append(Rating.from_db(rating_in_db))
        
        return ratings
    
    async def get_average_rating(self, user_id: str) -> float:
        """Get average rating for a user."""
        db = await get_database()
        
        pipeline = [
            {"$match": {"rated_id": user_id}},
            {"$group": {"_id": None, "average": {"$avg": "$score"}}}
        ]
        
        result = await db.carpool.ratings.aggregate(pipeline).to_list(length=1)
        
        if result:
            return result[0]["average"]
        
        return 0.0
