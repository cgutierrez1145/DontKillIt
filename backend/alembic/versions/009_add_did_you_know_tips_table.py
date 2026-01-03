"""Add did_you_know_tips table

Revision ID: 009
Revises: 008
Create Date: 2026-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '009'
down_revision: Union[str, None] = '008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create did_you_know_tips table
    op.create_table(
        'did_you_know_tips',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('species', sa.String(length=255), nullable=True),
        sa.Column('plant_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('url', sa.String(length=1000), nullable=True),
        sa.Column('source_domain', sa.String(length=200), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('is_favorited', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_did_you_know_tips_id'), 'did_you_know_tips', ['id'], unique=False)
    op.create_index('idx_tips_user_species', 'did_you_know_tips', ['user_id', 'species'])


def downgrade() -> None:
    # Drop did_you_know_tips table
    op.drop_index('idx_tips_user_species', table_name='did_you_know_tips')
    op.drop_index(op.f('ix_did_you_know_tips_id'), table_name='did_you_know_tips')
    op.drop_table('did_you_know_tips')
