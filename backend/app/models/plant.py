from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Plant(Base):
    """Plant model for storing user's plants."""

    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    species = Column(String(255), nullable=True)  # Scientific name from PlantNet
    plant_type = Column(String(100), nullable=True)  # e.g., "succulent", "fern", "flowering"
    notes = Column(Text, nullable=True)  # User's custom notes
    photo_url = Column(String(500), nullable=True)  # Main plant photo
    location = Column(String(255), nullable=True)  # e.g., "Living room windowsill"

    # Care recommendations
    lighting_requirement = Column(String(100), nullable=True)  # "low", "medium", "bright indirect", "direct sun"
    light_score = Column(Float, nullable=True)  # 0.0-1.0, computed from room photo analysis
    misting_frequency = Column(String(50), nullable=True)  # "daily", "2-3x/week", "weekly", "rare"
    humidity_preference = Column(String(50), nullable=True)  # "low (30-40%)", "medium (40-60%)", "high (60-80%)"
    temperature_range = Column(String(100), nullable=True)  # "60-75°F", "65-80°F", etc.
    soil_type = Column(String(200), nullable=True)  # "well-draining cactus mix", "rich potting soil", etc.
    ideal_room_type = Column(String(100), nullable=True)  # "bathroom", "kitchen", "living room", etc.
    room_placement = Column(String(200), nullable=True)  # "near east window", "3-5 feet from south window"
    seasonal_outdoor = Column(Boolean, nullable=True)  # Can go outside in summer?
    seasonal_notes = Column(Text, nullable=True)  # Additional seasonal care info
    care_summary = Column(Text, nullable=True)  # Auto-generated summary from web search

    # Pet safety
    pet_friendly = Column(Boolean, nullable=True)  # True if safe for pets, False if toxic

    # PlantNet identification data
    plantnet_confidence = Column(Float, nullable=True)  # Confidence score from PlantNet ID (0.0-1.0)
    identified_common_name = Column(String(255), nullable=True)  # Common name from PlantNet
    auto_identified = Column(Boolean, nullable=True, server_default='false')  # True if identified via PlantNet

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to user
    # user = relationship("User", back_populates="plants")

    def __repr__(self):
        return f"<Plant(id={self.id}, name={self.name}, user_id={self.user_id})>"
