from datetime import datetime

from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str

class RegisterResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str

    model_config = {
        "from_attributes": True
    }

class UserResponse(BaseModel):
    uuid: str
    username: str
    email: EmailStr
    full_name: str
    last_login: datetime | None

    model_config = {
        "from_attributes": True
    }