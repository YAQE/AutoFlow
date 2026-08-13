from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class Automation(Base):
    __tablename__ = "automations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    goal: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    trigger: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
    )

    actions: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="automations",
    )