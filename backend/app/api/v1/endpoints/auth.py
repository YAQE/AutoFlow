from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from app.schemas.auth_schema import UserResponse
from app.core.dependencies import get_current_user
from app.models.user import User
from app.database.database import get_db
from app.schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()

@router.get("/me", response_model=UserResponse, summary="Current user",)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.post("/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return AuthService.login(
        form_data.username,
        form_data.password,
        db,
    )


@router.post("/register", response_model=RegisterResponse, summary="User registration")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    return AuthService.register(request, db)
