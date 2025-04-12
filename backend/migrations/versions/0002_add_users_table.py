"""Add users table

Revision ID: 0002
Revises: 0001
Create Date: 2025-04-12 20:02:25.767958

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    sa.Enum("user", "admin", name="user_role").create(op.get_bind())
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("pwd_hash", sa.String(), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM(
                "user", "admin", name="user_role", create_type=False
            ),
            nullable=False,
        ),
        sa.Column("disabilities", sa.ARRAY(sa.String()), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("users_pkey")),
        sa.UniqueConstraint("email", name=op.f("users_email_key")),
    )


def downgrade() -> None:
    op.drop_table("users")
    sa.Enum("user", "admin", name="user_role").drop(op.get_bind())
