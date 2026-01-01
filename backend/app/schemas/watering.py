"""Watering schedule and history schemas."""
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List


# Watering Schedule Schemas
class WateringScheduleBase(BaseModel):
    """Base schema for watering schedule."""
    frequency_days: int = Field(..., ge=1, description="Number of days between waterings")


class WateringScheduleCreate(WateringScheduleBase):
    """Schema for creating a watering schedule."""
    pass


class WateringScheduleUpdate(BaseModel):
    """Schema for updating a watering schedule."""
    frequency_days: Optional[int] = Field(None, ge=1)


class WateringScheduleResponse(WateringScheduleBase):
    """Schema for watering schedule response."""
    id: int
    plant_id: int
    last_watered: Optional[date]
    next_watering: Optional[date]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Watering History Schemas
class WateringHistoryBase(BaseModel):
    """Base schema for watering history."""
    notes: Optional[str] = Field(None, max_length=500)


class WateringHistoryCreate(WateringHistoryBase):
    """Schema for creating a watering history entry."""
    watered_at: Optional[datetime] = None  # If not provided, use current time


class WateringHistoryResponse(WateringHistoryBase):
    """Schema for watering history response."""
    id: int
    plant_id: int
    watered_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class WateringHistoryListResponse(BaseModel):
    """Schema for list of watering history entries."""
    history: List[WateringHistoryResponse]
    total: int
