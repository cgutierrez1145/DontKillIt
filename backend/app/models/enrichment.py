"""Plant data enrichment tracking models."""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Date, JSON
from sqlalchemy.sql import func
from app.database import Base


class PlantEnrichment(Base):
    """
    Track enrichment status for each plant.
    Stores data fetched from external APIs like Perenual.
    """
    __tablename__ = "plant_enrichments"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Perenual data
    perenual_id = Column(Integer, nullable=True)  # Perenual's internal plant ID
    perenual_fetched_at = Column(DateTime(timezone=True), nullable=True)
    perenual_query_used = Column(String(255), nullable=True)  # What query matched

    # Enrichment status flags
    has_watering_data = Column(Boolean, default=False)
    has_sunlight_data = Column(Boolean, default=False)
    has_care_level_data = Column(Boolean, default=False)
    has_toxicity_data = Column(Boolean, default=False)
    has_soil_data = Column(Boolean, default=False)
    has_description = Column(Boolean, default=False)

    # Detailed watering info from Perenual
    watering_category = Column(String(50), nullable=True)  # "Frequent", "Average", "Minimum", "None"
    watering_benchmark_value = Column(String(50), nullable=True)  # e.g., "5-7"
    watering_benchmark_unit = Column(String(50), nullable=True)  # "days"

    # Care metadata
    care_level = Column(String(50), nullable=True)  # "Low", "Medium", "High"
    growth_rate = Column(String(50), nullable=True)
    maintenance = Column(String(50), nullable=True)
    cycle = Column(String(50), nullable=True)  # "Perennial", "Annual", etc.

    # Environment preferences
    hardiness_min = Column(String(10), nullable=True)
    hardiness_max = Column(String(10), nullable=True)
    drought_tolerant = Column(Boolean, nullable=True)
    soil_types = Column(JSON, nullable=True)  # List of soil types

    # Plant info
    scientific_name = Column(String(255), nullable=True)
    common_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    origin = Column(JSON, nullable=True)  # List of origin regions
    propagation_methods = Column(JSON, nullable=True)
    flowering_season = Column(String(100), nullable=True)

    # Toxicity
    poisonous_to_pets = Column(Boolean, nullable=True)
    poisonous_to_humans = Column(Boolean, nullable=True)

    # Image URL from Perenual
    perenual_image_url = Column(String(500), nullable=True)

    # Error tracking
    last_error = Column(Text, nullable=True)
    error_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<PlantEnrichment(id={self.id}, plant_id={self.plant_id}, perenual_id={self.perenual_id})>"


class EnrichmentLog(Base):
    """
    Log of daily enrichment runs for tracking API usage and progress.
    """
    __tablename__ = "enrichment_logs"

    id = Column(Integer, primary_key=True, index=True)
    run_date = Column(Date, nullable=False)

    # API usage tracking
    perenual_requests_made = Column(Integer, default=0)
    perenual_requests_limit = Column(Integer, default=100)

    # Results
    plants_processed = Column(Integer, default=0)
    plants_enriched = Column(Integer, default=0)  # Successfully enriched
    plants_not_found = Column(Integer, default=0)  # No match in Perenual
    plants_errored = Column(Integer, default=0)

    # Timing
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Status
    status = Column(String(50), default="pending")  # pending, running, completed, failed

    # Error info
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<EnrichmentLog(id={self.id}, date={self.run_date}, status={self.status})>"


class SpeciesCache(Base):
    """
    Cache of species data from Perenual API.
    Allows looking up data without re-querying the API.
    Multiple plants with the same species can share this cached data.
    """
    __tablename__ = "species_cache"

    id = Column(Integer, primary_key=True, index=True)
    perenual_id = Column(Integer, unique=True, nullable=False, index=True)

    # Names (for lookup)
    scientific_name = Column(String(255), nullable=True, index=True)
    common_name = Column(String(255), nullable=True, index=True)
    alternative_names = Column(JSON, nullable=True)  # List of other common names

    # Full API response cached
    raw_data = Column(JSON, nullable=True)

    # Parsed care data
    watering = Column(String(50), nullable=True)
    watering_frequency_days = Column(Integer, nullable=True)
    sunlight = Column(JSON, nullable=True)  # List of sunlight requirements
    lighting_requirement = Column(String(100), nullable=True)
    care_level = Column(String(50), nullable=True)
    growth_rate = Column(String(50), nullable=True)
    maintenance = Column(String(50), nullable=True)
    cycle = Column(String(50), nullable=True)
    hardiness_min = Column(String(10), nullable=True)
    hardiness_max = Column(String(10), nullable=True)
    drought_tolerant = Column(Boolean, nullable=True)
    soil_types = Column(JSON, nullable=True)
    indoor = Column(Boolean, nullable=True)
    poisonous_to_pets = Column(Boolean, nullable=True)
    poisonous_to_humans = Column(Boolean, nullable=True)
    description = Column(Text, nullable=True)
    origin = Column(JSON, nullable=True)
    propagation = Column(JSON, nullable=True)
    flowering_season = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)

    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SpeciesCache(id={self.id}, perenual_id={self.perenual_id}, name={self.common_name})>"
