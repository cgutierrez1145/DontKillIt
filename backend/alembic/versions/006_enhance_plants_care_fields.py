"""Enhance plants table with care fields

Revision ID: 006
Revises: 005
Create Date: 2026-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add care-related columns to plants table
    op.add_column('plants', sa.Column('lighting_requirement', sa.String(length=100), nullable=True))
    op.add_column('plants', sa.Column('light_score', sa.Float(), nullable=True))
    op.add_column('plants', sa.Column('misting_frequency', sa.String(length=50), nullable=True))
    op.add_column('plants', sa.Column('humidity_preference', sa.String(length=50), nullable=True))
    op.add_column('plants', sa.Column('temperature_range', sa.String(length=100), nullable=True))
    op.add_column('plants', sa.Column('soil_type', sa.String(length=200), nullable=True))
    op.add_column('plants', sa.Column('ideal_room_type', sa.String(length=100), nullable=True))
    op.add_column('plants', sa.Column('room_placement', sa.String(length=200), nullable=True))
    op.add_column('plants', sa.Column('seasonal_outdoor', sa.Boolean(), nullable=True))
    op.add_column('plants', sa.Column('seasonal_notes', sa.Text(), nullable=True))
    op.add_column('plants', sa.Column('care_summary', sa.Text(), nullable=True))
    op.add_column('plants', sa.Column('plantnet_confidence', sa.Float(), nullable=True))
    op.add_column('plants', sa.Column('identified_common_name', sa.String(length=255), nullable=True))
    op.add_column('plants', sa.Column('auto_identified', sa.Boolean(), nullable=True))

    # Create index on species for faster lookups
    op.create_index('idx_plants_species', 'plants', ['species'])


def downgrade() -> None:
    # Drop index
    op.drop_index('idx_plants_species', table_name='plants')

    # Drop added columns
    op.drop_column('plants', 'auto_identified')
    op.drop_column('plants', 'identified_common_name')
    op.drop_column('plants', 'plantnet_confidence')
    op.drop_column('plants', 'care_summary')
    op.drop_column('plants', 'seasonal_notes')
    op.drop_column('plants', 'seasonal_outdoor')
    op.drop_column('plants', 'room_placement')
    op.drop_column('plants', 'ideal_room_type')
    op.drop_column('plants', 'soil_type')
    op.drop_column('plants', 'temperature_range')
    op.drop_column('plants', 'humidity_preference')
    op.drop_column('plants', 'misting_frequency')
    op.drop_column('plants', 'light_score')
    op.drop_column('plants', 'lighting_requirement')
