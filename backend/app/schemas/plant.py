from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class PlantBase(BaseModel):
    """Base schema for plant data."""
    name: str = Field(..., min_length=1, max_length=255, description="Plant name")
    species: Optional[str] = Field(None, max_length=255, description="Scientific name")
    plant_type: Optional[str] = Field(None, max_length=100, description="Type of plant (e.g., succulent, fern)")
    notes: Optional[str] = Field(None, description="Custom notes about the plant")
    photo_url: Optional[str] = Field(None, max_length=500, description="URL to plant photo")
    location: Optional[str] = Field(None, max_length=255, description="Where the plant is located")


class PlantCreate(PlantBase):
    """Schema for creating a new plant."""
    pass


class PlantUpdate(BaseModel):
    """Schema for updating a plant (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    species: Optional[str] = Field(None, max_length=255)
    plant_type: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None
    photo_url: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=255)


class PlantResponse(PlantBase):
    """Schema for plant response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlantListResponse(BaseModel):
    """Schema for list of plants response."""
    plants: list[PlantResponse]
    total: int
