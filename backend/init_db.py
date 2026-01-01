"""Initialize database tables."""
from app.database import engine, Base
from app.models.user import User
from app.models.plant import Plant

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✓ Database tables created successfully!")
