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

    # Care recommendations
    lighting_requirement: Optional[str] = Field(None, max_length=100, description="Lighting needs")
    light_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Computed light score")
    misting_frequency: Optional[str] = Field(None, max_length=50, description="How often to mist")
    humidity_preference: Optional[str] = Field(None, max_length=50, description="Humidity preference")
    temperature_range: Optional[str] = Field(None, max_length=100, description="Ideal temperature range")
    soil_type: Optional[str] = Field(None, max_length=200, description="Recommended soil type")
    ideal_room_type: Optional[str] = Field(None, max_length=100, description="Best room for this plant")
    room_placement: Optional[str] = Field(None, max_length=200, description="Where to place in room")
    seasonal_outdoor: Optional[bool] = Field(None, description="Can go outside seasonally")
    seasonal_notes: Optional[str] = Field(None, description="Seasonal care notes")
    care_summary: Optional[str] = Field(None, description="Care summary")

    # Pet safety
    pet_friendly: Optional[bool] = Field(None, description="Safe for pets (cats/dogs)")

    # PlantNet identification data
    plantnet_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="PlantNet confidence score")
    identified_common_name: Optional[str] = Field(None, max_length=255, description="Common name from PlantNet")
    auto_identified: Optional[bool] = Field(None, description="Auto-identified via PlantNet")


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

    # Care recommendations
    lighting_requirement: Optional[str] = Field(None, max_length=100)
    light_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    misting_frequency: Optional[str] = Field(None, max_length=50)
    humidity_preference: Optional[str] = Field(None, max_length=50)
    temperature_range: Optional[str] = Field(None, max_length=100)
    soil_type: Optional[str] = Field(None, max_length=200)
    ideal_room_type: Optional[str] = Field(None, max_length=100)
    room_placement: Optional[str] = Field(None, max_length=200)
    seasonal_outdoor: Optional[bool] = None
    seasonal_notes: Optional[str] = None
    care_summary: Optional[str] = None

    # Pet safety
    pet_friendly: Optional[bool] = None

    # PlantNet identification data
    plantnet_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    identified_common_name: Optional[str] = Field(None, max_length=255)
    auto_identified: Optional[bool] = None


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
