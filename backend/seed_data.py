import os
import sys

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from app.database import Base, engine, SessionLocal
    from app.models.database_models import User, Ride, Booking, Rating
    from app.auth import get_password_hash
    from datetime import datetime, timedelta
    import random
except Exception as e:
    print(f"Import error: {e}")
    print(f"Python path: {sys.path}")
    sys.exit(1)

# Create database tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

# Add seed data
def seed_data():
    db = SessionLocal()
    
    # Check if data already exists
    user_count = db.query(User).count()
    print(f"Found {user_count} existing users in database.")
    
    if user_count > 0:
        print("Database already contains data. Skipping seeding.")
        # Print the first user for verification
        first_user = db.query(User).first()
        if first_user:
            print(f"Sample user: {first_user.email} (ID: {first_user.id})")
        db.close()
        return
    
    # Create users
    users = [
        User(
            name="John Driver",
            email="john.driver@example.com",
            phone="123-456-7890",
            role="driver",
            hashed_password=get_password_hash("password123")
        ),
        User(
            name="Sarah Rider",
            email="sarah.rider@example.com",
            phone="123-456-7891",
            role="rider",
            hashed_password=get_password_hash("password123")
        ),
        User(
            name="Mike Both",
            email="mike.both@example.com",
            phone="123-456-7892",
            role="both",
            hashed_password=get_password_hash("password123")
        )
    ]
    
    db.add_all(users)
    db.commit()
    
    # Create rides
    now = datetime.now()
    rides = [
        Ride(
            driver_id=users[0].id,
            origin="University Campus",
            destination="Downtown",
            departure_time=now + timedelta(days=1),
            available_seats=3,
            price=5.00,
            description="Regular ride to downtown"
        ),
        Ride(
            driver_id=users[2].id,
            origin="Downtown",
            destination="University Campus",
            departure_time=now + timedelta(days=1, hours=8),
            available_seats=2,
            price=5.00,
            description="Return ride to campus"
        ),
        Ride(
            driver_id=users[0].id,
            origin="University Campus",
            destination="Shopping Mall",
            departure_time=now + timedelta(days=2),
            available_seats=4,
            price=6.50,
            description="Weekend shopping trip"
        )
    ]
    
    db.add_all(rides)
    db.commit()
    
    # Create bookings
    bookings = [
        Booking(
            ride_id=rides[0].id,
            passenger_id=users[1].id,
            status="confirmed",
            seats=1
        ),
        Booking(
            ride_id=rides[1].id,
            passenger_id=users[1].id,
            status="pending",
            seats=1
        )
    ]
    
    db.add_all(bookings)
    
    # Update available seats
    rides[0].available_seats -= 1
    rides[1].available_seats -= 1
    
    db.commit()
    
    # Create ratings
    ratings = [
        Rating(
            rater_id=users[1].id,
            rated_id=users[0].id,
            ride_id=rides[0].id,
            rating=5,
            comment="Great driver, very punctual!"
        )
    ]
    
    db.add_all(ratings)
    db.commit()
    
    print("Seed data added successfully!")
    db.close()

if __name__ == "__main__":
    init_db()
    seed_data()
