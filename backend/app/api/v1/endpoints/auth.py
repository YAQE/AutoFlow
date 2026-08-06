from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="User login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    return AuthService.login(
        request.username,
        request.password,
        db,
    )
@router.post("/register", response_model=RegisterResponse, summary="User registration")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    return AuthService.register(request, db)
