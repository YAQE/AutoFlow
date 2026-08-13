from fastapi import APIRouter

from app.api.v1 import root
from app.api.v1.endpoints import (
    health,
    auth,
    users,
    workflow,
    assistant,
    automation,
)


api_router = APIRouter()

api_router.include_router(root.router)

api_router.include_router(
    health.router,
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    workflow.router,
)

api_router.include_router(
    assistant.router,
)

api_router.include_router(
    automation.router,
)