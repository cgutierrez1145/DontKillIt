from pydantic import BaseModel, Field
from typing import Optional


class PlantNetIdentificationRequest(BaseModel):
    """Schema for plant identification request."""
    organ: str = Field(default="auto", description="Plant organ (auto, flower, leaf, fruit, bark)")


class PetToxicityInfo(BaseModel):
    """Pet toxicity information for a plant."""
    pet_friendly: bool = Field(..., description="True if safe for pets")
    toxicity_level: str = Field(..., description="safe, mild, moderate, severe, or unknown")
    toxic_parts: Optional[str] = Field(None, description="Which parts are toxic")
    symptoms: Optional[str] = Field(None, description="Symptoms if ingested by pets")
    source: str = Field(default="ASPCA", description="Data source (ASPCA or web_search)")


class PlantNetIdentificationResult(BaseModel):
    """Schema for a single PlantNet identification result."""
    species: str = Field(..., description="Scientific name")
    common_name: Optional[str] = Field(None, description="Common name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    family: Optional[str] = Field(None, description="Plant family")
    genus: Optional[str] = Field(None, description="Plant genus")
    pet_toxicity: Optional[PetToxicityInfo] = Field(None, description="Pet toxicity information")


class PlantNetIdentificationResponse(BaseModel):
    """Schema for PlantNet identification response."""
    results: list[PlantNetIdentificationResult] = Field(..., description="List of identification results")
    top_result: Optional[PlantNetIdentificationResult] = Field(None, description="Best match")
    total_results: int = Field(..., description="Total number of results")
    photo_url: Optional[str] = Field(None, description="URL of the uploaded photo for use when creating the plant")
