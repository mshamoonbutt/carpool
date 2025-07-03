import sys
import os

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.database import SessionLocal
from app.models.database_models import User, Ride, Booking, Rating

def check_database():
    """Check database contents and print summary."""
    db = SessionLocal()
    
    # Check users
    users = db.query(User).all()
    print(f"\n--- Users ({len(users)}) ---")
    for user in users:
        print(f"ID: {user.id}, Name: {user.name}, Email: {user.email}, Role: {user.role}, Password: {user.hashed_password[:10]}...")
    
    # Check rides
    rides = db.query(Ride).all()
    print(f"\n--- Rides ({len(rides)}) ---")
    for ride in rides:
        print(f"ID: {ride.id}, Driver: {ride.driver_id}, From: {ride.origin} → To: {ride.destination}, Seats: {ride.available_seats}, Status: {ride.status}")
    
    # Check bookings
    bookings = db.query(Booking).all()
    print(f"\n--- Bookings ({len(bookings)}) ---")
    for booking in bookings:
        print(f"ID: {booking.id}, Ride: {booking.ride_id}, Passenger: {booking.passenger_id}, Status: {booking.status}")
    
    # Check ratings
    ratings = db.query(Rating).all()
    print(f"\n--- Ratings ({len(ratings)}) ---")
    for rating in ratings:
        print(f"ID: {rating.id}, From: {rating.rater_id}, To: {rating.rated_id}, Rating: {rating.rating}, Comment: {rating.comment}")
    
    db.close()

if __name__ == "__main__":
    print("\n🔍 Checking database contents...")
    check_database()
    print("\nDone!")
