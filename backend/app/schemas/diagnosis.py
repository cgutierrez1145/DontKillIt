"""Diagnosis and photo schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


# Photo Schemas
class PlantPhotoBase(BaseModel):
    """Base schema for plant photo."""
    description: Optional[str] = Field(None, description="Description of the plant problem")


class PlantPhotoCreate(PlantPhotoBase):
    """Schema for creating a plant photo (used internally)."""
    photo_url: str


class PlantPhotoResponse(PlantPhotoBase):
    """Schema for plant photo response."""
    id: int
    plant_id: int
    photo_url: str
    created_at: datetime

    class Config:
        from_attributes = True


# Diagnosis Solution Schemas
class DiagnosisSolutionResponse(BaseModel):
    """Schema for diagnosis solution response."""
    id: int
    photo_id: int
    title: str
    snippet: Optional[str]
    url: str
    rank: int
    created_at: datetime

    class Config:
        from_attributes = True


# Diagnosis Request/Response
class DiagnosisRequest(BaseModel):
    """Schema for diagnosis request."""
    description: str = Field(..., min_length=1, description="Description of the plant problem")
    search_query: Optional[str] = Field(None, description="Custom search query (optional, will be auto-generated if not provided)")


class DiagnosisResponse(BaseModel):
    """Schema for complete diagnosis response."""
    photo: PlantPhotoResponse
    solutions: List[DiagnosisSolutionResponse]
    total_solutions: int


class DiagnosisListResponse(BaseModel):
    """Schema for list of diagnoses."""
    diagnoses: List[PlantPhotoResponse]
    total: int
