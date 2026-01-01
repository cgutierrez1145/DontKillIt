"""Feeding schedule and history schemas."""
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List


# Feeding Schedule Schemas
class FeedingScheduleBase(BaseModel):
    """Base schema for feeding schedule."""
    frequency_days: int = Field(..., ge=1, description="Number of days between feedings")


class FeedingScheduleCreate(FeedingScheduleBase):
    """Schema for creating a feeding schedule."""
    pass


class FeedingScheduleUpdate(BaseModel):
    """Schema for updating a feeding schedule."""
    frequency_days: Optional[int] = Field(None, ge=1)


class FeedingScheduleResponse(FeedingScheduleBase):
    """Schema for feeding schedule response."""
    id: int
    plant_id: int
    last_fed: Optional[date]
    next_feeding: Optional[date]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Feeding History Schemas
class FeedingHistoryBase(BaseModel):
    """Base schema for feeding history."""
    notes: Optional[str] = Field(None, max_length=500)


class FeedingHistoryCreate(FeedingHistoryBase):
    """Schema for creating a feeding history entry."""
    fed_at: Optional[datetime] = None  # If not provided, use current time


class FeedingHistoryResponse(FeedingHistoryBase):
    """Schema for feeding history response."""
    id: int
    plant_id: int
    fed_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class FeedingHistoryListResponse(BaseModel):
    """Schema for list of feeding history entries."""
    history: List[FeedingHistoryResponse]
    total: int
