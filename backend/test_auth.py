import sys
import os

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.database import SessionLocal
from app.auth import verify_password, create_access_token
from app.models.database_models import User
from datetime import timedelta

def test_authentication():
    """Test authentication with the database."""
    email = "john.driver@example.com"
    password = "password123"
    
    db = SessionLocal()
    
    # Get user from database
    print(f"Looking for user with email: {email}")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"❌ ERROR: User with email {email} not found in database")
        
        # List all users in the database
        all_users = db.query(User).all()
        print(f"\nFound {len(all_users)} users in database:")
        for u in all_users:
            print(f"- {u.email} (ID: {u.id}, Role: {u.role})")
        
        db.close()
        return
    
    print(f"✅ Found user: {user.name} (ID: {user.id}, Email: {user.email})")
    
    # Check password
    print(f"Checking password...")
    if not user.hashed_password:
        print(f"❌ ERROR: User has no hashed password")
        db.close()
        return
    
    print(f"Hashed password in DB: {user.hashed_password[:20]}...")
    
    if verify_password(password, user.hashed_password):
        print(f"✅ Password is correct!")
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        print(f"✅ Generated access token: {access_token[:20]}...")
    else:
        print(f"❌ ERROR: Password is incorrect")
    
    db.close()

if __name__ == "__main__":
    print("\n🔐 Testing authentication...")
    test_authentication()
    print("\nDone!")
