import sys
import os

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.database import Base, engine, SessionLocal
from app.models.database_models import User, Ride, Booking, Rating
from app.auth import get_password_hash
from datetime import datetime, timedelta

def force_seed_data():
    """Force seed data creation by deleting existing data and creating new data."""
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)  # Drop all tables
    Base.metadata.create_all(bind=engine)  # Recreate tables
    
    # Create database session
    db = SessionLocal()
    
    # Create users
    print("Creating test users...")
    users = [
        User(
            name="John Driver",
            email="john.driver@example.com",
            phone="123-456-7890",
            role="driver",
            hashed_password=get_password_hash("password123"),
            is_active=True
        ),
        User(
            name="Sarah Rider",
            email="sarah.rider@example.com",
            phone="123-456-7891",
            role="rider",
            hashed_password=get_password_hash("password123"),
            is_active=True
        ),
        User(
            name="Mike Both",
            email="mike.both@example.com",
            phone="123-456-7892",
            role="both",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
    ]
    
    db.add_all(users)
    db.commit()
    
    # Fetch the users to get their IDs
    john = db.query(User).filter(User.email == "john.driver@example.com").first()
    sarah = db.query(User).filter(User.email == "sarah.rider@example.com").first()
    mike = db.query(User).filter(User.email == "mike.both@example.com").first()
    
    if not john or not sarah or not mike:
        print("Error: Failed to create users")
        db.close()
        return
    
    # Create rides
    print("Creating sample rides...")
    now = datetime.now()
    rides = [
        Ride(
            driver_id=john.id,
            origin="University Campus",
            destination="Downtown",
            departure_time=now + timedelta(days=1),
            available_seats=3,
            price=5.00,
            description="Regular ride to downtown",
            status="scheduled"
        ),
        Ride(
            driver_id=mike.id,
            origin="Downtown",
            destination="University Campus",
            departure_time=now + timedelta(days=1, hours=8),
            available_seats=2,
            price=5.00,
            description="Return ride to campus",
            status="scheduled"
        ),
        Ride(
            driver_id=john.id,
            origin="University Campus",
            destination="Shopping Mall",
            departure_time=now + timedelta(days=2),
            available_seats=4,
            price=6.50,
            description="Weekend shopping trip",
            status="scheduled"
        )
    ]
    
    db.add_all(rides)
    db.commit()
    
    # Fetch the rides to get their IDs
    ride1 = db.query(Ride).filter(Ride.destination == "Downtown").first()
    ride2 = db.query(Ride).filter(Ride.destination == "University Campus").first()
    
    if not ride1 or not ride2:
        print("Error: Failed to create rides")
        db.close()
        return
    
    # Create bookings
    print("Creating sample bookings...")
    bookings = [
        Booking(
            ride_id=ride1.id,
            passenger_id=sarah.id,
            status="confirmed",
            seats=1
        ),
        Booking(
            ride_id=ride2.id,
            passenger_id=sarah.id,
            status="pending",
            seats=1
        )
    ]
    
    db.add_all(bookings)
    
    # Update available seats
    ride1.available_seats -= 1
    ride2.available_seats -= 1
    
    db.commit()
    
    # Create ratings
    print("Creating sample ratings...")
    ratings = [
        Rating(
            rater_id=sarah.id,
            rated_id=john.id,
            ride_id=ride1.id,
            rating=5,
            comment="Great driver, very punctual!"
        )
    ]
    
    db.add_all(ratings)
    db.commit()
    
    print("\nSeed data created successfully!")
    
    # Print summary
    user_count = db.query(User).count()
    ride_count = db.query(Ride).count()
    booking_count = db.query(Booking).count()
    rating_count = db.query(Rating).count()
    
    print(f"\nDatabase summary:")
    print(f"- Users: {user_count}")
    print(f"- Rides: {ride_count}")
    print(f"- Bookings: {booking_count}")
    print(f"- Ratings: {rating_count}")
    
    db.close()

if __name__ == "__main__":
    print("\n🌱 Force seeding database with test data...")
    force_seed_data()
    print("\nDone!")
