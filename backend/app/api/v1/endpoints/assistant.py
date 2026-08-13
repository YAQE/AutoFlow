from fastapi import APIRouter

from app.schemas.assistant_schema import (
    AssistantMessageRequest,
    AssistantMessageResponse,
)
from app.services.assistant_service import AssistantService


router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"],
)


@router.post(
    "/message",
    response_model=AssistantMessageResponse,
)
async def send_message(
    request: AssistantMessageRequest,
):
    intent, message = await AssistantService.respond(
        request.message,
    )

    return AssistantMessageResponse(
        intent=intent,
        message=message,
    )