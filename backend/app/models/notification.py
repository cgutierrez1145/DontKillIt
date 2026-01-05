"""Notification models."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Time, JSON
from sqlalchemy.sql import func
from app.database import Base
import enum


class NotificationType(str, enum.Enum):
    """Type of notification."""
    WATERING = "WATERING"
    FEEDING = "FEEDING"
    DIAGNOSIS = "DIAGNOSIS"
    SYSTEM = "SYSTEM"


class NotificationPriority(str, enum.Enum):
    """Priority level for notifications."""
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class Platform(str, enum.Enum):
    """Device platform."""
    IOS = "ios"
    ANDROID = "android"
    WEB = "web"


class NotificationToken(Base):
    """Model for device notification tokens."""
    __tablename__ = "notification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_id = Column(String(255), nullable=False)
    platform = Column(String(20), nullable=False)
    token = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_used_at = Column(DateTime(timezone=True))
    active = Column(Boolean, default=True, nullable=False)


class Notification(Base):
    """Model for in-app notifications."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="SET NULL"))
    notification_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="NORMAL")
    read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True))
    data = Column(JSON)  # Additional metadata (deep links, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NotificationPreferences(Base):
    """Model for user notification preferences."""
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Channel preferences
    push_enabled = Column(Boolean, default=True, nullable=False)
    in_app_enabled = Column(Boolean, default=True, nullable=False)
    email_enabled = Column(Boolean, default=False, nullable=False)

    # Notification type preferences
    watering_reminders = Column(Boolean, default=True, nullable=False)
    feeding_reminders = Column(Boolean, default=True, nullable=False)
    diagnosis_alerts = Column(Boolean, default=True, nullable=False)
    system_notifications = Column(Boolean, default=True, nullable=False)

    # Timing preferences
    quiet_hours_start = Column(Time)
    quiet_hours_end = Column(Time)
    timezone = Column(String(50), default="UTC")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
