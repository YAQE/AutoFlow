from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.workflow_schema import (
    WorkflowCreate,
    WorkflowResponse,
    WorkflowUpdate,
)
from app.schemas.auth_schema import UserResponse
from app.services.workflow_service import WorkflowService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("/", response_model=list[WorkflowResponse], summary="List current user's workflows")
def get_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return WorkflowService.get_workflows(
        current_user=current_user,
        db=db,
    )

@router.get(
    "/{workflow_id}",
    response_model=WorkflowResponse,
    summary="Get a workflow",
)


def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = WorkflowService.get_workflow_by_id(
        workflow_id=workflow_id,
        current_user=current_user,
        db=db,
    )

    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    return workflow

@router.put(
    "/{workflow_id}",
    response_model=WorkflowResponse,
    summary="Update a workflow",
)
def update_workflow(
    workflow_id: int,
    request: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workflow = WorkflowService.update_workflow(
        workflow_id=workflow_id,
        request=request,
        current_user=current_user,
        db=db,
    )

    if workflow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    return workflow

@router.delete(
    "/{workflow_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a workflow",
)
def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = WorkflowService.delete_workflow(
        workflow_id=workflow_id,
        current_user=current_user,
        db=db,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )


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
