"""Add nodes table

Revision ID: 0004
Revises: 0003
Create Date: 2025-04-13 12:29:37.076881

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    sa.Enum("full", "partial", "none", name="node_accessibility").create(
        op.get_bind()
    )
    op.create_table(
        "nodes",
        sa.Column("osm_id", sa.String(), nullable=False),
        sa.Column(
            "accessibility",
            postgresql.ENUM(
                "full",
                "partial",
                "none",
                name="node_accessibility",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("osm_id", name=op.f("nodes_pkey")),
    )


def downgrade() -> None:
    op.drop_table("nodes")
    sa.Enum("full", "partial", "none", name="node_accessibility").drop(
        op.get_bind()
    )
