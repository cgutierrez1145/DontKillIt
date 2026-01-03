from pydantic import BaseModel, Field
from typing import Optional


class PlantNetIdentificationRequest(BaseModel):
    """Schema for plant identification request."""
    organ: str = Field(default="auto", description="Plant organ (auto, flower, leaf, fruit, bark)")


class PlantNetIdentificationResult(BaseModel):
    """Schema for a single PlantNet identification result."""
    species: str = Field(..., description="Scientific name")
    common_name: Optional[str] = Field(None, description="Common name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    family: Optional[str] = Field(None, description="Plant family")
    genus: Optional[str] = Field(None, description="Plant genus")


class PlantNetIdentificationResponse(BaseModel):
    """Schema for PlantNet identification response."""
    results: list[PlantNetIdentificationResult] = Field(..., description="List of identification results")
    top_result: Optional[PlantNetIdentificationResult] = Field(None, description="Best match")
    total_results: int = Field(..., description="Total number of results")
