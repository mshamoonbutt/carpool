import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, rides, bookings

app = FastAPI(
    title="UniPool API",
    description="Backend API for UniPool carpooling application",
    version="1.0.0"
)

# Setup CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your Next.js frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(rides.router, prefix="/api/rides", tags=["rides"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])

@app.get("/")
async def root():
    return {"message": "Welcome to UniPool API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
