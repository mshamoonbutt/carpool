from typing import List
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # JWT settings
    SECRET_KEY: str = "YOUR_SECRET_KEY_HERE"  # In production, use a secure random key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # MongoDB settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "carpool"
    
    # CORS settings
    CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:5173",  # React development server
        "http://localhost:5174",
        "http://localhost:3000",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
