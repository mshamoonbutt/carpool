import sys
import os

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Add the current directory to sys.path if it's not already there
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Now try to import from app
try:
    from app.database import Base, engine, SessionLocal
    print("Successfully imported from app.database!")
    
    # Try to create the database tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    
    from app.models.database_models import User
    print("Successfully imported User model!")
    
    # Try to create a session
    db = SessionLocal()
    print("Successfully created database session!")
    db.close()
    
except Exception as e:
    print(f"Error: {e}")

print("Path:", sys.path)
