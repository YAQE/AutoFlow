from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship

from app.database.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(150), nullable=False)

    description = Column(Text, nullable=True)

    prompt = Column(Text, nullable=False)

    status = Column(Enum("active", "inactive", name="workflow_status"), nullable=False, default="active")

    created_at = Column(DateTime, nullable=False, default=datetime.now)

    updated_at = Column(DateTime, nullable=False, default=datetime.now)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False,)

    owner = relationship("User", back_populates="workflows",)

    runs = relationship("WorkflowRun", back_populates="workflow", cascade="all, delete-orphan",)