from typing import Literal

from pydantic import BaseModel, Field


class AssistantMessageRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=10_000,
    )


class AssistantMessageResponse(BaseModel):
    intent: Literal[
        "assistant_chat",
        "automation",
    ]

    message: str