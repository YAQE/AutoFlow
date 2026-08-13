from typing import Any

from pydantic import BaseModel, Field


class AutomationAnalyzeRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=10_000,
    )


class AutomationAnalysisResponse(BaseModel):
    goal: str
    trigger: dict[str, Any]
    actions: list[dict[str, Any]]
    missing_information: list[str]