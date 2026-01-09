from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.utils.auth import get_current_user
from app.models.user import User
import os

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Import and start scheduler
from app.services.scheduler import scheduler_service

@app.on_event("startup")
async def startup_event():
    """Start background scheduler on app startup."""
    scheduler_service.start_reminder_job()

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler on app shutdown."""
    scheduler_service.shutdown()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for photo uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/photos", StaticFiles(directory=settings.UPLOAD_DIR), name="photos")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to DontKillIt Plant Care API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION
    }


@app.post("/api/v1/reminders/trigger")
async def trigger_reminders(current_user: User = Depends(get_current_user)):
    """Manually trigger reminder check (for testing)."""
    result = await scheduler_service.trigger_reminder_check_now()
    return result


# Include routers
from app.routers import auth, plants, watering, feeding, diagnosis, identification, care, rooms, tips, notifications

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(plants.router, prefix="/api/v1/plants", tags=["Plants"])
app.include_router(watering.router, prefix="/api/v1", tags=["Watering"])
app.include_router(feeding.router, prefix="/api/v1", tags=["Feeding"])
app.include_router(diagnosis.router, prefix="/api/v1", tags=["Diagnosis"])
app.include_router(identification.router, prefix="/api/v1", tags=["Plant Identification"])
app.include_router(care.router, prefix="/api/v1", tags=["Care Recommendations"])
app.include_router(rooms.router, prefix="/api/v1", tags=["Rooms"])
app.include_router(tips.router, prefix="/api/v1", tags=["Tips"])
app.include_router(notifications.router, prefix="/api/v1", tags=["Notifications"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
