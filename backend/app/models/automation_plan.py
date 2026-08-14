from typing import Any, Literal

from pydantic import BaseModel, Field


class Trigger(BaseModel):
    type: Literal["schedule", "webhook", "manual"]
    configuration: dict[str, Any] = Field(default_factory=dict)


class Action(BaseModel):
    type: Literal[
        "web_scrape",
        "send_email",
        "send_telegram",
        "webhook",
        "transform_data",
        "filter",
    ]
    configuration: dict[str, Any] = Field(default_factory=dict)


class AutomationPlan(BaseModel):
    goal: str
    trigger: Trigger
    actions: list[Action]
    missing_information: list[str] = Field(default_factory=list)
