from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class RoomPhoto(Base):
    """Room photo model for storing user's room photos with lighting analysis."""

    __tablename__ = "room_photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    room_name = Column(String(255), nullable=False)  # "Living Room", "Bedroom", etc.
    photo_url = Column(String(500), nullable=False)  # Stored photo path

    # Manual user input
    user_tagged_lighting = Column(String(50), nullable=True)  # "bright", "medium", "low"
    user_notes = Column(Text, nullable=True)  # User's description

    # AI-analyzed data
    ai_lighting_score = Column(Float, nullable=True)  # 0.0-1.0 (computed via image analysis)
    ai_lighting_category = Column(String(50), nullable=True)  # "bright", "medium", "low"
    ai_analysis_complete = Column(Boolean, nullable=True, server_default='false')  # Has AI analysis finished?

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<RoomPhoto(id={self.id}, room_name={self.room_name}, user_id={self.user_id})>"
