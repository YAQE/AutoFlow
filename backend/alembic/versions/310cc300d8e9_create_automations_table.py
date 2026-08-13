"""create automations table

Revision ID: 310cc300d8e9
Revises: 75d358cf2f0f
Create Date: ...
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "310cc300d8e9"
down_revision: Union[str, Sequence[str], None] = "75d358cf2f0f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "automations",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=150),
            nullable=False,
        ),
        sa.Column(
            "goal",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "trigger",
            sa.JSON(),
            nullable=False,
        ),
        sa.Column(
            "actions",
            sa.JSON(),
            nullable=False,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_automations_id"),
        "automations",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_automations_user_id"),
        "automations",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_automations_user_id"),
        table_name="automations",
    )

    op.drop_index(
        op.f("ix_automations_id"),
        table_name="automations",
    )

    op.drop_table("automations")