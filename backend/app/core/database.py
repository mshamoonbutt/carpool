from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def get_database() -> AsyncIOMotorClient:
    """
    Get MongoDB client.
    """
    return db.client


async def connect_to_mongodb():
    """
    Connect to MongoDB.
    """
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print("Connected to MongoDB")


async def close_mongodb_connection():
    """
    Close MongoDB connection.
    """
    db.client.close()
    print("MongoDB connection closed")
