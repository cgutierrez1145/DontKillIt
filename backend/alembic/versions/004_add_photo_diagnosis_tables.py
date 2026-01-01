"""Add photo and diagnosis tables

Revision ID: 004
Revises: 003
Create Date: 2025-12-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create plant_photos table
    op.create_table(
        'plant_photos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('photo_url', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_plant_photos_id'), 'plant_photos', ['id'], unique=False)

    # Create diagnosis_solutions table
    op.create_table(
        'diagnosis_solutions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('photo_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('snippet', sa.Text(), nullable=True),
        sa.Column('url', sa.String(length=1000), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['photo_id'], ['plant_photos.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_diagnosis_solutions_id'), 'diagnosis_solutions', ['id'], unique=False)


def downgrade() -> None:
    # Drop diagnosis_solutions table
    op.drop_index(op.f('ix_diagnosis_solutions_id'), table_name='diagnosis_solutions')
    op.drop_table('diagnosis_solutions')

    # Drop plant_photos table
    op.drop_index(op.f('ix_plant_photos_id'), table_name='plant_photos')
    op.drop_table('plant_photos')
