from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_bookings():
    return {"message": "Bookings route is active"}
