from fastapi import APIRouter

from app.api.endpoints import auth, users, rides, bookings, ratings, ai

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(rides.router, prefix="/rides", tags=["rides"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(ratings.router, prefix="/ratings", tags=["ratings"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
