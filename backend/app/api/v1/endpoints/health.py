from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health")
def health():
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": settings.STATUS,
        "environment": "development",
    }