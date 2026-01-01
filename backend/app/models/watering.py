"""Watering schedule and history models."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from app.database import Base


class WateringSchedule(Base):
    """Model for watering schedules."""
    __tablename__ = "watering_schedules"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, unique=True)
    frequency_days = Column(Integer, nullable=False)  # How many days between watering
    last_watered = Column(Date, nullable=True)  # Last time the plant was watered
    next_watering = Column(Date, nullable=True)  # Next scheduled watering date
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WateringHistory(Base):
    """Model for watering history log."""
    __tablename__ = "watering_history"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    watered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    notes = Column(String(500), nullable=True)  # Optional notes about this watering
    created_at = Column(DateTime(timezone=True), server_default=func.now())
