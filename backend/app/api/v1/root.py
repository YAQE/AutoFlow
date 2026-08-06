from fastapi import APIRouter
from app.services.root_service import RootService

router = APIRouter()

@router.get("/")
def root():
    return RootService.get_app_info()