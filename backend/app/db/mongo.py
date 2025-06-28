from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["carpool_db"]

# ✅ Add these collection definitions
users_collection = db["users"]
rides_collection = db["rides"]        # <== THIS LINE is missing
bookings_collection = db["bookings"]  # (needed later)
ratings_collection = db["ratings"]    # (needed later)
