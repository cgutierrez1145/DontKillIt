from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class DidYouKnowTip(Base):
    """Did you know tip model for storing personalized plant care tips."""

    __tablename__ = "did_you_know_tips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Link to plant species or specific plant
    species = Column(String(255), nullable=True)  # General species tips
    plant_id = Column(Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=True)  # Or specific plant tips

    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)  # Tip description/snippet
    url = Column(String(1000), nullable=True)  # Link to full article
    source_domain = Column(String(200), nullable=True)  # e.g., "gardeningknowhow.com"

    is_read = Column(Boolean, nullable=True, server_default='false')  # Track if user has seen it
    is_favorited = Column(Boolean, nullable=True, server_default='false')  # Allow users to save tips

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<DidYouKnowTip(id={self.id}, title={self.title[:30]}..., user_id={self.user_id})>"
