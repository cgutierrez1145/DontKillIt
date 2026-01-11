"""Initialize database tables."""
from app.database import engine, Base
from app.models.user import User
from app.models.plant import Plant
from app.models.watering import WateringSchedule, WateringHistory
from app.models.feeding import FeedingSchedule, FeedingHistory
from app.models.photo import PlantPhoto, DiagnosisSolution
from app.models.reminder import Reminder
from app.models.enrichment import PlantEnrichment, EnrichmentLog, SpeciesCache

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✓ Database tables created successfully!")
print("  - Users, Plants, Watering, Feeding")
print("  - Photos, Diagnosis, Reminders")
print("  - Enrichment tracking (PlantEnrichment, EnrichmentLog, SpeciesCache)")
