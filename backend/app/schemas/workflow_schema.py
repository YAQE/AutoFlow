from datetime import datetime

from pydantic import BaseModel
from typing import Literal

class WorkflowCreate(BaseModel):
    title: str
    description: str | None = None
    prompt: str

class WorkflowUpdate(BaseModel):
    title: str
    description: str | None = None
    prompt: str
    status: Literal["active", "inactive"]


class WorkflowResponse(BaseModel):
    id: int
    title: str
    description: str | None
    prompt: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }