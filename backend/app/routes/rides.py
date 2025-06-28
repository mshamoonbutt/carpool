from fastapi import APIRouter, Depends, HTTPException
from app.models.ride import RideCreate
from app.db.mongo import rides_collection, users_collection
from app.utils.auth import decode_token, oauth2_scheme
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
def post_ride(ride: RideCreate, token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload["sub"]
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["role"] not in ["driver", "both"]:
        raise HTTPException(status_code=403, detail="Only drivers can post rides")

    ride_data = ride.dict()
    ride_data.update({
        "driver_id": user_id,
        "driver_name": user["name"],
        "available_seats": ride.seats,
        "bookings": [],
        "created_at": datetime.utcnow().isoformat()
    })

    result = rides_collection.insert_one(ride_data)
    ride_data["_id"] = str(result.inserted_id)
    return {"message": "Ride posted", "ride": ride_data}
