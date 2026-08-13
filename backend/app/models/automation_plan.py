from typing import Any

from pydantic import BaseModel, Field


class Trigger(BaseModel):
    type: str
    configuration: dict[str, Any] = Field(default_factory=dict)


class Action(BaseModel):
    type: str
    configuration: dict[str, Any] = Field(default_factory=dict)


class AutomationPlan(BaseModel):
    goal: str
    trigger: Trigger
    actions: list[Action]
    missing_information: list[str] = Field(default_factory=list)