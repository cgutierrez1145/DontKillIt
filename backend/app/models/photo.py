"""Photo and diagnosis models."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base


class PlantPhoto(Base):
    """Model for plant photos."""
    __tablename__ = "plant_photos"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    photo_url = Column(String(500), nullable=False)  # Path to stored photo
    description = Column(Text, nullable=True)  # User's description of the problem
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DiagnosisSolution(Base):
    """Model for diagnosis search results."""
    __tablename__ = "diagnosis_solutions"

    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("plant_photos.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)  # Title from search result
    snippet = Column(Text, nullable=True)  # Description/snippet from search
    url = Column(String(1000), nullable=False)  # Link to the solution
    rank = Column(Integer, nullable=False)  # Position in search results
    created_at = Column(DateTime(timezone=True), server_default=func.now())
