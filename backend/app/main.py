from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
import os

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc"
)

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


# Include routers
from app.routers import auth, plants, watering, feeding

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(plants.router, prefix="/api/v1/plants", tags=["Plants"])
app.include_router(watering.router, prefix="/api/v1", tags=["Watering"])
app.include_router(feeding.router, prefix="/api/v1", tags=["Feeding"])

# More routers will be added in future sprints:
# from app.routers import diagnosis, reminders
# app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["diagnosis"])
# app.include_router(reminders.router, prefix="/api/v1/reminders", tags=["reminders"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
