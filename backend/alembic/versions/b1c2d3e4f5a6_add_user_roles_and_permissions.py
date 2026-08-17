"""Add user roles and permissions

Revision ID: b1c2d3e4f5a6
Revises: a9b8c7d6e5f4
Create Date: 2026-08-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, None] = "a9b8c7d6e5f4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(length=50), server_default="viewer", nullable=False))
    op.add_column("users", sa.Column("allowed_pages", postgresql.JSONB(), server_default="[]", nullable=False))


def downgrade() -> None:
    op.drop_column("users", "allowed_pages")
    op.drop_column("users", "role")
