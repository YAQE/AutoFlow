from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database.database import Base


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(Integer, primary_key=True, index=True)

    workflow_id = Column(
        Integer,
        ForeignKey("workflows.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    input_text = Column(Text, nullable=False)
    output_text = Column(Text, nullable=True)

    status = Column(
        Enum(
            "pending",
            "running",
            "completed",
            "failed",
            name="workflow_run_status",
        ),
        nullable=False,
        default="pending",
    )

    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    workflow = relationship(
        "Workflow",
        back_populates="runs",
    )

    user = relationship(
        "User",
        back_populates="workflow_runs",
    )