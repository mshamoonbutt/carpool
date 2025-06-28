from fastapi import APIRouter, HTTPException
from app.models.user import UserCreate, UserLogin
from app.db.mongo import users_collection
from passlib.hash import bcrypt
from bson.objectid import ObjectId
from app.utils.auth import create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.auth import decode_token, oauth2_scheme
from fastapi import APIRouter, Depends, HTTPException
from app.db.mongo import users_collection
from app.utils.auth import decode_token, oauth2_scheme
from bson.objectid import ObjectId

router = APIRouter()

ALLOWED_DOMAINS = ["formanite.fccollege.edu.pk", "fccollege.edu.pk"]

def is_valid_domain(email: str) -> bool:
    return any(email.endswith("@" + domain) for domain in ALLOWED_DOMAINS)

@router.post("/register")
def register_user(user: UserCreate):
    try:
        print(f"Received registration for: {user.email}")

        if not is_valid_domain(user.email):
            print("❌ Invalid domain")
            raise HTTPException(status_code=403, detail="Only FCC email addresses are allowed.")

        existing_user = users_collection.find_one({"email": user.email})
        if existing_user:
            print("❌ Email already registered")
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pw = bcrypt.hash(user.password)
        print("✅ Password hashed")

        user_dict = user.dict()
        user_dict["password"] = hashed_pw

        result = users_collection.insert_one(user_dict)
        print(f"✅ User inserted with ID: {result.inserted_id}")

        user_dict["_id"] = str(result.inserted_id)
        return {"message": "User registered successfully", "user": user_dict}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        


@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username
    password = form_data.password

    if not is_valid_domain(email):
        raise HTTPException(status_code=403, detail="Only FCC emails allowed")

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.verify(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": str(user["_id"])})
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = users_collection.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "phone": user["phone"]
    }