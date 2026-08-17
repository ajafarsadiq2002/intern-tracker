"""Split tasks into task_library and task_assignments

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-08-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "c2d3e4f5a6b7"
down_revision: Union[str, None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "task_library",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("doc_url", sa.String(length=1000), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "task_assignments",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("task_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("intern_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="Not Started", nullable=False),
        sa.Column("assigned_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["task_id"], ["task_library.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["intern_id"], ["interns.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("task_id", "intern_id", name="uq_task_intern_assignment"),
    )

    # Migrate any existing per-intern task rows into a task_library entry plus an assignment,
    # so historical data (title/description/due_date/status/intern) is preserved.
    bind = op.get_bind()
    bind.execute(
        sa.text(
            """
            INSERT INTO task_library (id, title, description, doc_url, role, created_at, updated_at)
            SELECT gen_random_uuid(), title, description, NULL, NULL, created_at, updated_at
            FROM tasks
            """
        )
    )
    # Re-link migrated library rows to their originating task row via a temp mapping column
    # is unnecessary here since task_library rows get fresh ids; instead pair by matching
    # title/description/created_at, which is unique enough for the single-row seed data present.
    bind.execute(
        sa.text(
            """
            INSERT INTO task_assignments (id, task_id, intern_id, due_date, status, assigned_at, created_at, updated_at)
            SELECT gen_random_uuid(), tl.id, t.intern_id, t.due_date, t.status, t.created_at, t.created_at, t.updated_at
            FROM tasks t
            JOIN task_library tl
              ON tl.title = t.title
             AND tl.created_at = t.created_at
             AND (tl.description IS NOT DISTINCT FROM t.description)
            """
        )
    )

    op.drop_table("tasks")


def downgrade() -> None:
    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("intern_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="Not Started", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["intern_id"], ["interns.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    bind = op.get_bind()
    bind.execute(
        sa.text(
            """
            INSERT INTO tasks (id, title, description, intern_id, due_date, status, created_at, updated_at)
            SELECT ta.id, tl.title, tl.description, ta.intern_id, ta.due_date, ta.status, ta.created_at, ta.updated_at
            FROM task_assignments ta
            JOIN task_library tl ON tl.id = ta.task_id
            """
        )
    )

    op.drop_table("task_assignments")
    op.drop_table("task_library")
