from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class RoomPhotoBase(BaseModel):
    """Base schema for room photo data."""
    room_name: str = Field(..., min_length=1, max_length=255, description="Name of the room")
    user_tagged_lighting: Optional[str] = Field(None, max_length=50, description="User's lighting assessment")
    user_notes: Optional[str] = Field(None, description="User's notes about the room")


class RoomPhotoCreate(RoomPhotoBase):
    """Schema for creating a new room photo."""
    pass


class RoomPhotoUpdate(BaseModel):
    """Schema for updating a room photo (all fields optional)."""
    room_name: Optional[str] = Field(None, min_length=1, max_length=255)
    user_tagged_lighting: Optional[str] = Field(None, max_length=50)
    user_notes: Optional[str] = None


class RoomPhotoResponse(RoomPhotoBase):
    """Schema for room photo response."""
    id: int
    user_id: int
    photo_url: str
    ai_lighting_score: Optional[float] = None
    ai_lighting_category: Optional[str] = None
    ai_analysis_complete: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoomPhotoListResponse(BaseModel):
    """Schema for list of room photos response."""
    rooms: list[RoomPhotoResponse]
    total: int
