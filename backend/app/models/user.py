from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # driver / rider / both
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
