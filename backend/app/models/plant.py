from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to user
    # user = relationship("User", back_populates="plants")

    def __repr__(self):
        return f"<Plant(id={self.id}, name={self.name}, user_id={self.user_id})>"
