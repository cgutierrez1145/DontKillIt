from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config import settings


def get_client_ip(request):
    """
    Get client IP address from request.
    Handles X-Forwarded-For header for reverse proxy setups.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # X-Forwarded-For can contain multiple IPs, take the first (original client)
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


# Create limiter instance with configurable storage
limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[settings.RATE_LIMIT_DEFAULT],
    storage_uri="memory://" if settings.RATE_LIMIT_STORAGE_TYPE == "memory" else settings.RATE_LIMIT_STORAGE_TYPE
)
