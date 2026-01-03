"""Add care_recommendations table

Revision ID: 008
Revises: 007
Create Date: 2026-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create care_recommendations table
    op.create_table(
        'care_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('species_name', sa.String(length=255), nullable=True),
        sa.Column('lighting', sa.Text(), nullable=True),
        sa.Column('watering', sa.Text(), nullable=True),
        sa.Column('humidity', sa.Text(), nullable=True),
        sa.Column('temperature', sa.Text(), nullable=True),
        sa.Column('misting', sa.Text(), nullable=True),
        sa.Column('soil', sa.Text(), nullable=True),
        sa.Column('room_placement', sa.Text(), nullable=True),
        sa.Column('seasonal_care', sa.Text(), nullable=True),
        sa.Column('source_url', sa.String(length=1000), nullable=True),
        sa.Column('source_title', sa.String(length=500), nullable=True),
        sa.Column('rank', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_care_recommendations_id'), 'care_recommendations', ['id'], unique=False)
    op.create_index('idx_care_recommendations_plant_id', 'care_recommendations', ['plant_id'])


def downgrade() -> None:
    # Drop care_recommendations table
    op.drop_index('idx_care_recommendations_plant_id', table_name='care_recommendations')
    op.drop_index(op.f('ix_care_recommendations_id'), table_name='care_recommendations')
    op.drop_table('care_recommendations')
