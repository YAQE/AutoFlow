from sqlalchemy.orm import Session

from app.models.workflow import Workflow
from app.models.user import User
from app.schemas.workflow_schema import (WorkflowCreate,)

class WorkflowService:

    @staticmethod
    def create_workflow(
        request: WorkflowCreate,
        current_user: User,
        db: Session,
    ):
        workflow = Workflow(
            title=request.title,
            description=request.description,
            prompt=request.prompt,
            owner_id=current_user.id,
        )

        db.add(workflow)
        db.commit()
        db.refresh(workflow)

        return workflow