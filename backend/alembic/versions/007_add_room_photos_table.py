"""Add room_photos table

Revision ID: 007
Revises: 006
Create Date: 2026-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create room_photos table
    op.create_table(
        'room_photos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('room_name', sa.String(length=255), nullable=False),
        sa.Column('photo_url', sa.String(length=500), nullable=False),
        sa.Column('user_tagged_lighting', sa.String(length=50), nullable=True),
        sa.Column('user_notes', sa.Text(), nullable=True),
        sa.Column('ai_lighting_score', sa.Float(), nullable=True),
        sa.Column('ai_lighting_category', sa.String(length=50), nullable=True),
        sa.Column('ai_analysis_complete', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_room_photos_id'), 'room_photos', ['id'], unique=False)
    op.create_index('idx_room_photos_user_id', 'room_photos', ['user_id'])


def downgrade() -> None:
    # Drop room_photos table
    op.drop_index('idx_room_photos_user_id', table_name='room_photos')
    op.drop_index(op.f('ix_room_photos_id'), table_name='room_photos')
    op.drop_table('room_photos')
