from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, UTC
from app.core.security import verify_password
from app.core.security import create_access_token
from fastapi import HTTPException
from app.models.user import User
from app.schemas.auth_schema import RegisterRequest
from app.core.security import hash_password
from app.core.exceptions import (
    UserAlreadyExistsException,
    InvalidCredentialsException,
    UserNotFoundException,
)

class AuthService:

    @staticmethod
    def login(username: str, password: str, db: Session):
        user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )
        if user is None:
            raise InvalidCredentialsException()
        
        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsException()

        
        access_token = create_access_token(
            {
                "sub": user.uuid,
            }
        )

        user.last_login = datetime.now(UTC)

        db.refresh(user)
        db.commit()

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }
    @staticmethod
    def register(request: RegisterRequest, db: Session):
        existing_email = db.query(User).filter(
        User.email == request.email).first()

        existing_username = db.query(User).filter(
        User.username == request.username).first()


        if existing_email:
            raise UserAlreadyExistsException()

        if existing_username:
            raise UserAlreadyExistsException()

        user = User(
            username=request.username,
            email=request.email,
            full_name=request.full_name,
            password_hash=hash_password(request.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user