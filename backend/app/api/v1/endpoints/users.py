from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.auth_schema import UserResponse

router = APIRouter()


@router.get("", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
):
    return db.query(User).all()