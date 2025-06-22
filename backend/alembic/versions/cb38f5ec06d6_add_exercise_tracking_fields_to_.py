"""Add exercise tracking fields to progress model

Revision ID: cb38f5ec06d6
Revises: 4cb3c3d10aee
Create Date: 2025-06-22 09:44:29.382296

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision: str = 'cb38f5ec06d6'
down_revision: Union[str, Sequence[str], None] = '4cb3c3d10aee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add exercise tracking fields to progress table
    op.add_column('progress', sa.Column('completed_exercises', sa.Integer(), nullable=True, default=0))
    op.add_column('progress', sa.Column('total_exercises', sa.Integer(), nullable=True, default=0))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove exercise tracking fields from progress table
    op.drop_column('progress', 'total_exercises')
    op.drop_column('progress', 'completed_exercises')
