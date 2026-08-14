from datetime import datetime, timedelta, UTC

from jose import jwt
from pwdlib import PasswordHash

from app.core.config import settings

password_hash = PasswordHash.recommended()


def create_access_token(data: dict):
    return create_token(
        data,
        expires_in=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(data: dict):
    return create_token(
        data,
        expires_in=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


def create_token(
    data: dict,
    expires_in: timedelta,
    token_type: str,
):
    to_encode = data.copy()
    expire = datetime.now(UTC) + expires_in

    to_encode.update(
        {
            "exp": expire,
            "type": token_type,
        }
    )

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256",
    )


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)
