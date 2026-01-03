from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class PlantCareRecommendationBase(BaseModel):
    """Base schema for plant care recommendation data."""
    species_name: Optional[str] = Field(None, max_length=255, description="Species name")
    lighting: Optional[str] = Field(None, description="Lighting recommendations")
    watering: Optional[str] = Field(None, description="Watering recommendations")
    humidity: Optional[str] = Field(None, description="Humidity recommendations")
    temperature: Optional[str] = Field(None, description="Temperature recommendations")
    misting: Optional[str] = Field(None, description="Misting recommendations")
    soil: Optional[str] = Field(None, description="Soil recommendations")
    room_placement: Optional[str] = Field(None, description="Room placement recommendations")
    seasonal_care: Optional[str] = Field(None, description="Seasonal care tips")
    source_url: Optional[str] = Field(None, max_length=1000, description="Source article URL")
    source_title: Optional[str] = Field(None, max_length=500, description="Source article title")
    rank: Optional[int] = Field(None, description="Search result rank")


class PlantCareRecommendationCreate(PlantCareRecommendationBase):
    """Schema for creating a new care recommendation."""
    plant_id: int


class PlantCareRecommendationResponse(PlantCareRecommendationBase):
    """Schema for care recommendation response."""
    id: int
    plant_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PlantCareRecommendationListResponse(BaseModel):
    """Schema for list of care recommendations response."""
    recommendations: list[PlantCareRecommendationResponse]
    total: int


class CareSearchResult(BaseModel):
    """Schema for categorized care search results."""
    category: str = Field(..., description="Category (lighting, watering, etc.)")
    results: list[dict] = Field(..., description="Search results for this category")
