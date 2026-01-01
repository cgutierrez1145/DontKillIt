"""Initialize database tables."""
from app.database import engine, Base
from app.models.user import User
from app.models.plant import Plant
from app.models.watering import WateringSchedule, WateringHistory
from app.models.feeding import FeedingSchedule, FeedingHistory

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✓ Database tables created successfully!")
