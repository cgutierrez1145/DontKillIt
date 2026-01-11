from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

import time
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings
from app.utils.auth import get_current_user
from app.utils.rate_limit import limiter
from app.utils.logging_config import setup_logging, get_logger
from app.models.user import User
import os

# Initialize logging
setup_logging()
logger = get_logger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add rate limiter to app state and register exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # XSS protection (legacy but still useful for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Restrict browser features
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(self)"

        # Content Security Policy - restrictive but allows API functionality
        response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"

        # HSTS - only enable in production (when not in debug mode)
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


# Request logging middleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000

        # Skip logging for health checks and static files
        path = request.url.path
        if path not in ["/api/v1/health", "/"] and not path.startswith("/photos"):
            logger.info(
                f"{request.method} {path} - {response.status_code} - {duration_ms:.1f}ms"
            )

        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)


# Import and start scheduler
from app.services.scheduler import scheduler_service


@app.on_event("startup")
async def startup_event():
    """Start background scheduler on app startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    scheduler_service.start_reminder_job()
    scheduler_service.start_enrichment_job()
    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler on app shutdown."""
    logger.info("Shutting down application...")
    scheduler_service.shutdown()
    logger.info("Application shutdown complete")


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
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
async def root(request: Request):
    """Root endpoint with API information."""
    return {
        "message": "Welcome to DontKillIt Plant Care API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/api/v1/health")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
async def health_check(request: Request):
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION
    }


@app.post("/api/v1/reminders/trigger")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
async def trigger_reminders(request: Request, current_user: User = Depends(get_current_user)):
    """Manually trigger reminder check (for testing)."""
    result = await scheduler_service.trigger_reminder_check_now()
    return result


# Include routers
from app.routers import auth, plants, watering, feeding, diagnosis, identification, care, rooms, tips, notifications, enrichment

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
app.include_router(enrichment.router, prefix="/api/v1", tags=["Data Enrichment"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
