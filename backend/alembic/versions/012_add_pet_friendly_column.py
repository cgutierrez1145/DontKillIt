"""Add pet_friendly column to plants table

Revision ID: 012
Revises: 011
Create Date: 2026-01-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '012'
down_revision: Union[str, None] = '011'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('plants', sa.Column('pet_friendly', sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column('plants', 'pet_friendly')
