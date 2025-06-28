from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_ratings():
    return {"message": "Ratings route is active"}
