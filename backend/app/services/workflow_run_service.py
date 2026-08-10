from datetime import datetime

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workflow_run import WorkflowRun
from app.schemas.workflow_schema import WorkflowRunRequest
from app.services.ai_provider_factory import get_ai_provider
from app.services.workflow_service import WorkflowService


class WorkflowRunService:
    @staticmethod
    async def run_workflow(
        workflow_id: int,
        request: WorkflowRunRequest,
        current_user: User,
        db: Session,
    ) -> WorkflowRun | None:
        workflow = WorkflowService.get_workflow_by_id(
            workflow_id=workflow_id,
            current_user=current_user,
            db=db,
        )

        if workflow is None:
            return None

        workflow_run = WorkflowRun(
            workflow_id=workflow.id,
            user_id=current_user.id,
            input_text=request.input_text,
            status="running",
        )

        db.add(workflow_run)
        db.commit()
        db.refresh(workflow_run)

        prompt = (
            f"{workflow.prompt}\n\n"
            f"User input:\n{request.input_text}"
        )

        try:
            provider = get_ai_provider()
            output = await provider.generate(prompt)

            workflow_run.output_text = output
            workflow_run.status = "completed"
            workflow_run.completed_at = datetime.now()

        except RuntimeError:
            workflow_run.status = "failed"
            workflow_run.error_message = (
                "AI generation failed"
            )
            workflow_run.completed_at = datetime.now()

            db.commit()
            db.refresh(workflow_run)

            raise

        db.commit()
        db.refresh(workflow_run)



        return workflow_run

    @staticmethod
    def get_workflow_runs(
        workflow_id: int,
        current_user: User,
        db: Session,
        limit: int = 20,
    ) -> list[WorkflowRun] | None:
        workflow = WorkflowService.get_workflow_by_id(
            workflow_id=workflow_id,
            current_user=current_user,
            db=db,
        )

        if workflow is None:
            return None

        return (
            db.query(WorkflowRun)
            .filter(
                WorkflowRun.workflow_id == workflow.id,
                WorkflowRun.user_id == current_user.id,
            )
            .order_by(WorkflowRun.created_at.desc())
            .limit(limit)
            .all()
        )