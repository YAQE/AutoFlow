from fastapi import APIRouter, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.workflow_schema import WorkflowCreate, WorkflowResponse
from app.schemas.auth_schema import UserResponse
from app.services.workflow_service import WorkflowService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/workflows", tags=["Workflows"])

@router.post("/", response_model=WorkflowResponse, summary="Create workflow")
def create_workflow(
    request: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return WorkflowService.create_workflow(
        request=request,
        current_user=current_user,
        db=db,
    )