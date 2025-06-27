from pymongo import MongoClient
from dotenv import load_dotenv
import os
import bcrypt


load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database("users")

users_collection = db["Users"]

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def insert_user(user_dict):
    # user_dict: id, name, email, major, phone_number, password, location
    if users_collection.find_one({"user_id": user_dict["id"]}):
        print("User already exists")
        return False
    else:
        users_collection.insert_one(user_dict)
        return True

def verify_password(user_id ,password, password_hash):
    return bcrypt.checkpw(password.encode('utf-8'), password_hash)

def get_user_profile(user_id):
    user = users_collection.find_one({"user_id": user_id})
    # only return username , major and location
    return {
        "username": user["name"],
        "major": user["major"],
        "location": user["location"]
    }

def get_user_by_email(email):
    return users_collection.find_one({"email": email})

def get_user_by_id(id):
    return users_collection.find_one({"id": id})