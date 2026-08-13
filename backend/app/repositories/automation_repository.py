from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.automation import Automation


class AutomationRepository:

    @staticmethod
    def create(
        db: Session,
        automation: Automation,
    ) -> Automation:

        db.add(automation)

        db.commit()

        db.refresh(automation)

        return automation

    @staticmethod
    def get_by_id(
        db: Session,
        automation_id: UUID,
    ) -> Automation | None:

        result = db.execute(
            select(Automation).where(
                Automation.id == automation_id
            )
        )

        return result.scalar_one_or_none()