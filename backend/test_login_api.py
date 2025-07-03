import requests
import json

def test_login_api():
    """Test the login API endpoint directly."""
    API_URL = "http://localhost:8000/api"
    
    # First check if the server is running
    try:
        response = requests.get("http://localhost:8000/")
        print(f"✅ Server is running. Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to server at http://localhost:8000/")
        print("Make sure the server is running with: uvicorn main:app --reload")
        return
    
    # Test login
    print("\nTesting login API...")
    login_url = f"{API_URL}/users/login"
    
    # Prepare login data
    login_data = {
        "username": "john.driver@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(
            login_url,
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Login successful!")
            token_data = response.json()
            print(f"Access token: {token_data['access_token'][:20]}...")
            
            # Test user profile API
            print("\nTesting user profile API...")
            profile_url = f"{API_URL}/users/me"
            
            profile_response = requests.get(
                profile_url,
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            
            if profile_response.status_code == 200:
                user_data = profile_response.json()
                print(f"✅ Got user profile: {user_data['name']} ({user_data['email']})")
            else:
                print(f"❌ Failed to get user profile. Status: {profile_response.status_code}")
                print(f"Error: {profile_response.text}")
        else:
            print(f"❌ Login failed. Response: {response.text}")
            
            # Test a different user
            print("\nTrying with different test users...")
            test_users = [
                {"username": "sarah.rider@example.com", "password": "password123"},
                {"username": "mike.both@example.com", "password": "password123"}
            ]
            
            for user in test_users:
                print(f"\nTrying login with: {user['username']}")
                resp = requests.post(
                    login_url,
                    data=user,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                
                if resp.status_code == 200:
                    print(f"✅ Login successful with {user['username']}!")
                    break
                else:
                    print(f"❌ Login failed with {user['username']}. Status: {resp.status_code}")
    
    except Exception as e:
        print(f"❌ Error during API test: {str(e)}")

if __name__ == "__main__":
    print("\n🔍 Testing login API...")
    test_login_api()
    print("\nDone!")
