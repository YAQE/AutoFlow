from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordRequestForm

# pyrefly: ignore [missing-import]
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
from app.core.config import settings
from app.core.security import create_access_token

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
    response: Response = None,
):
    tokens = AuthService.login(
        form_data.username,
        form_data.password,
        db,
    )
    response.set_cookie(
        key="autoflow_refresh_token",
        value=tokens.pop("refresh_token"),
        httponly=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth",
    )
    return tokens


@router.post("/refresh", response_model=LoginResponse)
def refresh_access_token(
    refresh_token: str | None = Cookie(default=None, alias="autoflow_refresh_token"),
):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_uuid = payload.get("sub")
        if not user_uuid or payload.get("type") != "refresh":
            raise JWTError()
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired") from exc

    return {"access_token": create_access_token({"sub": user_uuid}), "token_type": "bearer"}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie("autoflow_refresh_token", path="/auth")


@router.post("/register", response_model=RegisterResponse, summary="User registration")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    return AuthService.register(request, db)
