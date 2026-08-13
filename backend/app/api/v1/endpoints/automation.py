from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.automation import Automation
from app.models.automation_plan import AutomationPlan
from app.models.user import User
from app.services.automation_service import AutomationService


class AutomationRequest(BaseModel):
    message: str
    current_plan: AutomationPlan | None = None


class AutomationCreateRequest(BaseModel):
    name: str
    plan: AutomationPlan


router = APIRouter(
    prefix="/automation",
    tags=["Automation"],
)


@router.post("/analyze")
async def analyze_automation(
    request: AutomationRequest,
):
    result = await AutomationService.analyze(
        message=request.message,
        current_plan=request.current_plan,
    )

    return result


@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
)
def create_automation(
    request: AutomationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = request.plan

    if plan.missing_information:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Automation plan is incomplete",
                "missing_information": (
                    plan.missing_information
                ),
            },
        )

    automation = Automation(
        user_id=current_user.id,
        name=request.name,
        goal=plan.goal,
        trigger=plan.trigger.model_dump(),
        actions=[
            action.model_dump()
            for action in plan.actions
        ],
        is_active=True,
    )

    db.add(automation)
    db.commit()
    db.refresh(automation)

    return {
        "id": automation.id,
        "name": automation.name,
        "goal": automation.goal,
        "trigger": automation.trigger,
        "actions": automation.actions,
        "is_active": automation.is_active,
        "created_at": automation.created_at,
        "updated_at": automation.updated_at,
    }

@router.get("/")
def get_automations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    automations = (
        db.query(Automation)
        .filter(
            Automation.user_id == current_user.id,
        )
        .order_by(
            Automation.created_at.desc(),
        )
        .all()
    )

    return automations

@router.get("/{automation_id}")
def get_automation(
    automation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    automation = (
        db.query(Automation)
        .filter(
            Automation.id == automation_id,
            Automation.user_id == current_user.id,
        )
        .first()
    )

    if automation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation not found",
        )

    return automation