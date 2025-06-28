from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, rides, bookings, ratings, ai

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set your frontend domain here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(rides.router, prefix="/api/rides", tags=["Rides"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["Ratings"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/")
def root():
    return {"message": "CARPOOL Backend API Running"}
