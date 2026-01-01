"""Initialize database tables."""
from app.database import engine, Base
from app.models.user import User
from app.models.plant import Plant
from app.models.watering import WateringSchedule, WateringHistory
from app.models.feeding import FeedingSchedule, FeedingHistory
from app.models.photo import PlantPhoto, DiagnosisSolution
from app.models.reminder import Reminder

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✓ Database tables created successfully!")
