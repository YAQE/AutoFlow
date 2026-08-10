from sqlalchemy.orm import Session



from app.models.workflow import Workflow
from app.models.user import User
from app.schemas.workflow_schema import WorkflowCreate, WorkflowUpdate

class WorkflowService:

    @staticmethod
    def get_workflows(
        current_user: User,
        db: Session,
    ):
        return (
            db.query(Workflow)
            .filter(Workflow.owner_id == current_user.id)
            .order_by(Workflow.created_at.desc())
            .all()
        )
    
    @staticmethod
    def get_workflow_by_id(
        workflow_id: int,
        current_user: User,
        db: Session,
    ):
        return (
            db.query(Workflow)
            .filter(
                Workflow.id == workflow_id,
                Workflow.owner_id == current_user.id,
            )
            .first()
        )

    @staticmethod
    def update_workflow(
        workflow_id: int,
        request: WorkflowUpdate,
        current_user: User,
        db: Session,
    ):
        workflow = WorkflowService.get_workflow_by_id(
            workflow_id=workflow_id,
            current_user=current_user,
            db=db,
        )

        if workflow is None:
            return None

        workflow.title = request.title
        workflow.description = request.description
        workflow.prompt = request.prompt
        workflow.status = request.status

        db.commit()
        db.refresh(workflow)

        return workflow


    @staticmethod
    def delete_workflow(
        workflow_id: int,
        current_user: User,
        db: Session,
    ) -> bool:
        workflow = WorkflowService.get_workflow_by_id(
            workflow_id=workflow_id,
            current_user=current_user,
            db=db,
        )

        if workflow is None:
            return False

        db.delete(workflow)
        db.commit()

        return True


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
