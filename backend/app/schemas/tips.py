from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class DidYouKnowTipBase(BaseModel):
    """Base schema for did you know tip data."""
    species: Optional[str] = Field(None, max_length=255, description="Plant species")
    plant_id: Optional[int] = Field(None, description="Specific plant ID")
    title: str = Field(..., min_length=1, max_length=500, description="Tip title")
    content: Optional[str] = Field(None, description="Tip content/snippet")
    url: Optional[str] = Field(None, max_length=1000, description="Link to full article")
    source_domain: Optional[str] = Field(None, max_length=200, description="Source domain")


class DidYouKnowTipCreate(DidYouKnowTipBase):
    """Schema for creating a new tip."""
    user_id: int


class DidYouKnowTipUpdate(BaseModel):
    """Schema for updating a tip (all fields optional)."""
    is_read: Optional[bool] = None
    is_favorited: Optional[bool] = None


class DidYouKnowTipResponse(DidYouKnowTipBase):
    """Schema for tip response."""
    id: int
    user_id: int
    is_read: Optional[bool] = None
    is_favorited: Optional[bool] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DidYouKnowTipListResponse(BaseModel):
    """Schema for list of tips response."""
    tips: list[DidYouKnowTipResponse]
    total: int
