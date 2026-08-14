from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import asc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.assistant_conversation import (
    AssistantConversation,
)
from app.models.assistant_message import (
    AssistantMessage,
)
from app.models.user import User
from app.schemas.assistant_schema import (
    AssistantConfigurationResponse,
    AssistantConversationResponse,
    AssistantMessageRequest,
    AssistantMessageResponse,
)
from app.services.assistant_service import (
    AssistantService,
)


router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"],
)


def latest_conversation(
    db: Session,
    user_id: int,
) -> AssistantConversation | None:

    return (
        db.query(AssistantConversation)
        .filter(
            AssistantConversation.user_id
            == user_id,
        )
        .order_by(
            AssistantConversation.updated_at.desc(),
        )
        .first()
    )


@router.get(
    "/configuration",
    response_model=AssistantConfigurationResponse,
)
async def get_configuration(
    current_user: User = Depends(
        get_current_user
    ),
):

    current_provider = (
        settings.AI_PROVIDER.lower()
    )

    current_model = (
        settings.GROQ_MODEL
        if current_provider == "groq"
        else settings.OLLAMA_MODEL
    )

    available_providers = {
        "ollama": [
            settings.OLLAMA_MODEL,
        ],
        "groq": [
            settings.GROQ_MODEL,
        ],
    }

    return AssistantConfigurationResponse(
        provider=current_provider,
        model=current_model,
        available_providers=available_providers,
    )


@router.get(
    "/conversation",
    response_model=AssistantConversationResponse,
)
def get_latest_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    conversation = latest_conversation(
        db=db,
        user_id=current_user.id,
    )

    if conversation is None:

        return AssistantConversationResponse(
            conversation_id=None,
            messages=[],
        )

    messages = (
        db.query(AssistantMessage)
        .filter(
            AssistantMessage.conversation_id
            == conversation.id,
        )
        .order_by(
            asc(AssistantMessage.created_at),
            asc(AssistantMessage.id),
        )
        .all()
    )

    return AssistantConversationResponse(
        conversation_id=conversation.id,
        messages=messages,
    )


@router.post(
    "/message",
    response_model=AssistantMessageResponse,
)
async def send_message(
    request: AssistantMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):

    conversation = latest_conversation(
        db=db,
        user_id=current_user.id,
    )

    if conversation is None:

        conversation = AssistantConversation(
            user_id=current_user.id,
            title=request.message[:150],
        )

        db.add(conversation)
        db.flush()

    user_message = AssistantMessage(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )

    db.add(user_message)
    db.flush()

    messages = (
        db.query(AssistantMessage)
        .filter(
            AssistantMessage.conversation_id
            == conversation.id,
        )
        .order_by(
            asc(AssistantMessage.created_at),
            asc(AssistantMessage.id),
        )
        .all()
    )

    history = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in messages[-20:]
    ]

    intent, response_message = (
        await AssistantService.respond(
            message=request.message,
            history=history,
            provider=request.provider,
            model=request.model,
        )
    )

    assistant_message = AssistantMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=response_message,
    )

    db.add(assistant_message)

    conversation.updated_at = datetime.utcnow()

    db.commit()

    return AssistantMessageResponse(
        intent=intent,
        message=response_message,
        conversation_id=conversation.id,
    )