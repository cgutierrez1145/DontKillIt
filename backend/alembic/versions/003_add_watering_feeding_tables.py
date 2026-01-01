"""Add watering and feeding tables

Revision ID: 003
Revises: 002
Create Date: 2025-12-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create watering_schedules table
    op.create_table(
        'watering_schedules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('frequency_days', sa.Integer(), nullable=False),
        sa.Column('last_watered', sa.Date(), nullable=True),
        sa.Column('next_watering', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('plant_id')
    )
    op.create_index(op.f('ix_watering_schedules_id'), 'watering_schedules', ['id'], unique=False)

    # Create watering_history table
    op.create_table(
        'watering_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('watered_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_watering_history_id'), 'watering_history', ['id'], unique=False)

    # Create feeding_schedules table
    op.create_table(
        'feeding_schedules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('frequency_days', sa.Integer(), nullable=False),
        sa.Column('last_fed', sa.Date(), nullable=True),
        sa.Column('next_feeding', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('plant_id')
    )
    op.create_index(op.f('ix_feeding_schedules_id'), 'feeding_schedules', ['id'], unique=False)

    # Create feeding_history table
    op.create_table(
        'feeding_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('fed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_feeding_history_id'), 'feeding_history', ['id'], unique=False)


def downgrade() -> None:
    # Drop feeding tables
    op.drop_index(op.f('ix_feeding_history_id'), table_name='feeding_history')
    op.drop_table('feeding_history')
    op.drop_index(op.f('ix_feeding_schedules_id'), table_name='feeding_schedules')
    op.drop_table('feeding_schedules')

    # Drop watering tables
    op.drop_index(op.f('ix_watering_history_id'), table_name='watering_history')
    op.drop_table('watering_history')
    op.drop_index(op.f('ix_watering_schedules_id'), table_name='watering_schedules')
    op.drop_table('watering_schedules')
