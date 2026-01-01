"""Reminder and notification models."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class ReminderType(str, enum.Enum):
    """Type of reminder."""
    WATERING = "watering"
    FEEDING = "feeding"


class Reminder(Base):
    """Model for scheduled reminders."""
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    reminder_type = Column(Enum(ReminderType), nullable=False)
    scheduled_for = Column(DateTime(timezone=True), nullable=False)  # When to send the reminder
    sent = Column(Boolean, default=False, nullable=False)  # Whether reminder was sent
    sent_at = Column(DateTime(timezone=True), nullable=True)  # When it was actually sent
    created_at = Column(DateTime(timezone=True), server_default=func.now())
