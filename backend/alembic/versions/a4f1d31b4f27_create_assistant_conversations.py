"""create assistant conversations and messages

Revision ID: a4f1d31b4f27
Revises: 310cc300d8e9
"""

from alembic import op
import sqlalchemy as sa


revision = "a4f1d31b4f27"
down_revision = "310cc300d8e9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "assistant_conversations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assistant_conversations_id", "assistant_conversations", ["id"])
    op.create_index("ix_assistant_conversations_user_id", "assistant_conversations", ["user_id"])

    op.create_table(
        "assistant_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["assistant_conversations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assistant_messages_id", "assistant_messages", ["id"])
    op.create_index("ix_assistant_messages_conversation_id", "assistant_messages", ["conversation_id"])


def downgrade() -> None:
    op.drop_index("ix_assistant_messages_conversation_id", table_name="assistant_messages")
    op.drop_index("ix_assistant_messages_id", table_name="assistant_messages")
    op.drop_table("assistant_messages")
    op.drop_index("ix_assistant_conversations_user_id", table_name="assistant_conversations")
    op.drop_index("ix_assistant_conversations_id", table_name="assistant_conversations")
    op.drop_table("assistant_conversations")
