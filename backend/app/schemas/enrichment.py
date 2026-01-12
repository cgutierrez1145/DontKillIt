"""Schemas for plant enrichment data."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PlantEnrichmentResponse(BaseModel):
    """Schema for plant enrichment data in responses."""
    id: int
    plant_id: int
    perenual_id: Optional[int] = None
    perenual_fetched_at: Optional[datetime] = None

    # Care metadata
    care_level: Optional[str] = None
    growth_rate: Optional[str] = None
    maintenance: Optional[str] = None
    cycle: Optional[str] = None

    # Watering details
    watering_category: Optional[str] = None
    watering_benchmark_value: Optional[str] = None
    watering_benchmark_unit: Optional[str] = None

    # Environment preferences
    hardiness_min: Optional[str] = None
    hardiness_max: Optional[str] = None
    drought_tolerant: Optional[bool] = None
    soil_types: Optional[List[str]] = None

    # Plant info
    scientific_name: Optional[str] = None
    common_name: Optional[str] = None
    description: Optional[str] = None
    origin: Optional[List[str]] = None
    propagation_methods: Optional[List[str]] = None
    flowering_season: Optional[str] = None

    # Toxicity
    poisonous_to_pets: Optional[bool] = None
    poisonous_to_humans: Optional[bool] = None

    # Image
    perenual_image_url: Optional[str] = None

    # Status flags
    has_watering_data: bool = False
    has_sunlight_data: bool = False
    has_care_level_data: bool = False
    has_toxicity_data: bool = False
    has_soil_data: bool = False
    has_description: bool = False

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnrichmentStatsResponse(BaseModel):
    """Schema for enrichment statistics."""
    plants_needing_enrichment: int
    plants_enriched: int
    cached_species_count: int
    today_api_requests: int
    api_request_limit: int


class EnrichmentLogResponse(BaseModel):
    """Schema for enrichment log entries."""
    id: int
    run_date: str
    status: str
    plants_processed: int
    plants_enriched: int
    plants_not_found: int
    plants_errored: int
    api_requests_used: int
    api_requests_limit: int
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_message: Optional[str] = None


class CachedSpeciesResponse(BaseModel):
    """Schema for cached species data."""
    id: int
    perenual_id: int
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    watering: Optional[str] = None
    watering_frequency_days: Optional[int] = None
    lighting_requirement: Optional[str] = None
    care_level: Optional[str] = None
    poisonous_to_pets: Optional[bool] = None
    indoor: Optional[bool] = None
    fetched_at: Optional[str] = None
