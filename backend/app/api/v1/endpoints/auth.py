from fastapi import APIRouter

from app.schemas.auth_schema import LoginRequest, LoginResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="User login")
def login(request: LoginRequest):
    return AuthService.login(
        request.username,
        request.password
        )