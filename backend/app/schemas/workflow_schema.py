from pydantic import BaseModel, Field, field_validator

from datetime import datetime
from typing import Literal

class WorkflowCreate(BaseModel):
    title: str
    description: str | None = None
    prompt: str | None = None

class WorkflowUpdate(BaseModel):
    title: str
    description: str | None = None
    prompt: str
    status: Literal["active", "inactive"]


class WorkflowResponse(BaseModel):
    id: int
    title: str
    description: str | None
    prompt: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class WorkflowRunRequest(BaseModel):
    input_text: str = Field(
        min_length=1,
        max_length=10_000,
    )

    @field_validator("input_text")
    @classmethod
    def input_text_must_not_be_blank(
        cls,
        value: str,
    ) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "Input text cannot be blank"
            )

        return value


class WorkflowRunResponse(BaseModel):
    id: int
    workflow_id: int
    input_text: str
    output_text: str | None
    status: str
    error_message: str | None
    created_at: datetime
    completed_at: datetime | None

    model_config = {
        "from_attributes": True,
    }