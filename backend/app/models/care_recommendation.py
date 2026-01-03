from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class PlantCareRecommendation(Base):
    """Care recommendation model for storing web search results about plant care."""

    __tablename__ = "care_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    species_name = Column(String(255), nullable=True)  # Species this recommendation is for

    # Web search results stored as structured data
    lighting = Column(Text, nullable=True)
    watering = Column(Text, nullable=True)
    humidity = Column(Text, nullable=True)
    temperature = Column(Text, nullable=True)
    misting = Column(Text, nullable=True)
    soil = Column(Text, nullable=True)
    room_placement = Column(Text, nullable=True)
    seasonal_care = Column(Text, nullable=True)

    source_url = Column(String(1000), nullable=True)  # URL of the source article
    source_title = Column(String(500), nullable=True)
    rank = Column(Integer, nullable=True)  # Search result ranking

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PlantCareRecommendation(id={self.id}, plant_id={self.plant_id}, species={self.species_name})>"
