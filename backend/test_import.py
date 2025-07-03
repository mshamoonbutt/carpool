# Simple test to check if SQLAlchemy can be imported
try:
    from sqlalchemy import create_engine
    print("SQLAlchemy imported successfully!")
    
    # Try importing from our app modules
    from app.database import Base, engine, SessionLocal
    print("app.database imported successfully!")
    
    from app.models.database_models import User, Ride, Booking, Rating
    print("app.models.database_models imported successfully!")
    
    print("All imports successful!")
except Exception as e:
    print(f"Error: {e}")
