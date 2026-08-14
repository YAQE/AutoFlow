from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AssistantProvider = Literal[
    "ollama",
    "groq",
]


class AssistantMessageRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=10_000,
    )

    provider: AssistantProvider | None = None

    model: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )


class AssistantMessageResponse(BaseModel):
    intent: Literal[
        "assistant_chat",
        "automation",
    ]

    message: str

    conversation_id: int


class AssistantHistoryMessage(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AssistantConversationResponse(BaseModel):
    conversation_id: int | None
    messages: list[AssistantHistoryMessage]


class AssistantConfigurationResponse(BaseModel):
    provider: AssistantProvider
    model: str
    available_providers: dict[str, list[str]]