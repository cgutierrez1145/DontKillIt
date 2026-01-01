"""Feeding schedule and history models."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from app.database import Base


class FeedingSchedule(Base):
    """Model for feeding schedules."""
    __tablename__ = "feeding_schedules"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, unique=True)
    frequency_days = Column(Integer, nullable=False)  # How many days between feeding
    last_fed = Column(Date, nullable=True)  # Last time the plant was fed
    next_feeding = Column(Date, nullable=True)  # Next scheduled feeding date
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class FeedingHistory(Base):
    """Model for feeding history log."""
    __tablename__ = "feeding_history"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    fed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    notes = Column(String(500), nullable=True)  # Optional notes about this feeding
    created_at = Column(DateTime(timezone=True), server_default=func.now())
