"""Add notifications system

Revision ID: 010
Revises: 009
Create Date: 2026-01-04
"""
from alembic import op
import sqlalchemy as sa

revision = '010'
down_revision = '009'
branch_labels = None
depends_on = None

def upgrade():
    # Detect database type
    bind = op.get_bind()
    is_sqlite = bind.engine.dialect.name == 'sqlite'
    # Create notification_tokens table
    op.create_table(
        'notification_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('device_id', sa.String(255), nullable=False),
        sa.Column('platform', sa.String(20), nullable=False),
        sa.Column('token', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('last_used_at', sa.DateTime(timezone=True)),
        sa.Column('active', sa.Boolean(), server_default='true'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'device_id', name='unique_device_per_user')
    )
    op.create_index('idx_notification_tokens_user_id', 'notification_tokens', ['user_id'])
    op.create_index('idx_notification_tokens_active', 'notification_tokens', ['active'])

    # Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer()),
        sa.Column('notification_type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(20), server_default='NORMAL'),
        sa.Column('read', sa.Boolean(), server_default='false'),
        sa.Column('read_at', sa.DateTime(timezone=True)),
        sa.Column('data', sa.JSON() if is_sqlite else sa.JSON()),  # Use JSON for both SQLite and PostgreSQL
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('idx_notifications_read', 'notifications', ['user_id', 'read'])
    op.create_index('idx_notifications_created_at', 'notifications', [sa.text('created_at DESC')])

    # Create notification_preferences table
    op.create_table(
        'notification_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('push_enabled', sa.Boolean(), server_default='true'),
        sa.Column('in_app_enabled', sa.Boolean(), server_default='true'),
        sa.Column('email_enabled', sa.Boolean(), server_default='false'),
        sa.Column('watering_reminders', sa.Boolean(), server_default='true'),
        sa.Column('feeding_reminders', sa.Boolean(), server_default='true'),
        sa.Column('diagnosis_alerts', sa.Boolean(), server_default='true'),
        sa.Column('system_notifications', sa.Boolean(), server_default='true'),
        sa.Column('quiet_hours_start', sa.Time()),
        sa.Column('quiet_hours_end', sa.Time()),
        sa.Column('timezone', sa.String(50), server_default='UTC'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    # Update reminders table
    if is_sqlite:
        # SQLite requires batch mode for adding foreign keys
        with op.batch_alter_table('reminders') as batch_op:
            batch_op.add_column(sa.Column('push_sent', sa.Boolean(), server_default='false'))
            batch_op.add_column(sa.Column('push_sent_at', sa.DateTime(timezone=True)))
            batch_op.add_column(sa.Column('in_app_notification_id', sa.Integer()))
            batch_op.add_column(sa.Column('delivery_error', sa.Text()))
            batch_op.create_foreign_key('fk_reminders_notification', 'notifications', ['in_app_notification_id'], ['id'])
    else:
        # PostgreSQL can add columns and foreign keys directly
        op.add_column('reminders', sa.Column('push_sent', sa.Boolean(), server_default='false'))
        op.add_column('reminders', sa.Column('push_sent_at', sa.DateTime(timezone=True)))
        op.add_column('reminders', sa.Column('in_app_notification_id', sa.Integer()))
        op.add_column('reminders', sa.Column('delivery_error', sa.Text()))
        op.create_foreign_key('fk_reminders_notification', 'reminders', 'notifications', ['in_app_notification_id'], ['id'])

def downgrade():
    op.drop_constraint('fk_reminders_notification', 'reminders', type_='foreignkey')
    op.drop_column('reminders', 'delivery_error')
    op.drop_column('reminders', 'in_app_notification_id')
    op.drop_column('reminders', 'push_sent_at')
    op.drop_column('reminders', 'push_sent')

    op.drop_table('notification_preferences')
    op.drop_table('notifications')
    op.drop_table('notification_tokens')
