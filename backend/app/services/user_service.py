from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import get_password_hash, verify_password
from app.models.user import UserCreate, UserInDB, User, UserUpdate


class UserService:
    """Service for user operations."""
    
    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Get a user by ID."""
        db = await get_database()
        user_data = await db.carpool.users.find_one({"_id": ObjectId(user_id)})
        
        if user_data:
            user_in_db = UserInDB(**user_data)
            return User.from_db(user_in_db)
        
        return None
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        db = await get_database()
        user_data = await db.carpool.users.find_one({"email": email})
        
        if user_data:
            user_in_db = UserInDB(**user_data)
            return User.from_db(user_in_db)
        
        return None
    
    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user."""
        user = await self.get_by_email(email)
        
        if not user:
            return None
        
        db = await get_database()
        user_data = await db.carpool.users.find_one({"email": email})
        
        if not verify_password(password, user_data["hashed_password"]):
            return None
        
        return user
    
    async def create(self, user_create: UserCreate) -> User:
        """Create a new user."""
        db = await get_database()
        
        # Check if email already exists
        existing_user = await db.carpool.users.find_one({"email": user_create.email})
        if existing_user:
            raise DuplicateKeyError("Email already registered")
        
        # Create user dictionary
        now = datetime.utcnow()
        user_dict = user_create.model_dump(exclude={"password"})
        user_dict.update({
            "_id": ObjectId(),
            "hashed_password": get_password_hash(user_create.password),
            "created_at": now,
            "updated_at": now,
            "is_active": True,
            "rides_offered": [],
            "rides_taken": [],
            "ratings": [],
        })
        
        # Insert user
        await db.carpool.users.insert_one(user_dict)
        
        # Return user
        user_in_db = UserInDB(**user_dict)
        return User.from_db(user_in_db)
    
    async def update(self, user_id: str, user_update: UserUpdate) -> Optional[User]:
        """Update a user."""
        db = await get_database()
        
        # Get user
        user_data = await db.carpool.users.find_one({"_id": ObjectId(user_id)})
        if not user_data:
            return None
        
        # Update user
        update_data = user_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await db.carpool.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user_data = await db.carpool.users.find_one({"_id": ObjectId(user_id)})
        user_in_db = UserInDB(**updated_user_data)
        return User.from_db(user_in_db)
    
    async def delete(self, user_id: str) -> bool:
        """Delete a user."""
        db = await get_database()
        result = await db.carpool.users.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users."""
        db = await get_database()
        users = []
        
        cursor = db.carpool.users.find().skip(skip).limit(limit)
        async for user_data in cursor:
            user_in_db = UserInDB(**user_data)
            users.append(User.from_db(user_in_db))
        
        return users
