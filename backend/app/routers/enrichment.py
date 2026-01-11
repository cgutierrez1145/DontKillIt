"""API endpoints for plant data enrichment."""
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.utils.auth import get_current_user
from app.utils.rate_limit import limiter
from app.config import settings
from app.models.user import User
from app.services.data_scraper import data_scraper
from app.services.scheduler import scheduler_service

router = APIRouter()


@router.get("/enrichment/stats")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
async def get_enrichment_stats(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get plant data enrichment statistics.

    Returns information about:
    - Total plants needing enrichment
    - Plants already enriched
    - Today's API usage
    - Cached species count
    """
    stats = data_scraper.get_enrichment_stats(db)
    return stats


@router.post("/enrichment/trigger")
@limiter.limit("5/hour")  # Strict limit to prevent API abuse
async def trigger_enrichment(
    request: Request,
    max_plants: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger plant data enrichment.

    This will:
    1. Find plants missing care data
    2. Fetch data from Perenual API (100 free/day limit)
    3. Update plant records with watering schedules and care info

    Args:
        max_plants: Optional limit on number of plants to process

    Returns:
        Enrichment results summary
    """
    result = await scheduler_service.trigger_enrichment_now(max_plants=max_plants)
    return result


@router.get("/enrichment/logs")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
async def get_enrichment_logs(
    request: Request,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recent enrichment run logs.

    Args:
        limit: Number of logs to return (default 10)

    Returns:
        List of enrichment log entries
    """
    from app.models.enrichment import EnrichmentLog

    logs = db.query(EnrichmentLog).order_by(
        EnrichmentLog.run_date.desc()
    ).limit(limit).all()

    return [
        {
            "id": log.id,
            "run_date": str(log.run_date),
            "status": log.status,
            "plants_processed": log.plants_processed,
            "plants_enriched": log.plants_enriched,
            "plants_not_found": log.plants_not_found,
            "plants_errored": log.plants_errored,
            "api_requests_used": log.perenual_requests_made,
            "api_requests_limit": log.perenual_requests_limit,
            "started_at": log.started_at.isoformat() if log.started_at else None,
            "completed_at": log.completed_at.isoformat() if log.completed_at else None,
            "error_message": log.error_message
        }
        for log in logs
    ]


@router.get("/enrichment/cache")
@limiter.limit(settings.RATE_LIMIT_DEFAULT)
async def get_cached_species(
    request: Request,
    search: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get cached species data from Perenual API.

    This shows species that have been fetched and cached,
    which can be reused without additional API calls.

    Args:
        search: Optional search term for species name
        limit: Number of results to return (default 20)

    Returns:
        List of cached species entries
    """
    from app.models.enrichment import SpeciesCache
    from sqlalchemy import or_, func

    query = db.query(SpeciesCache)

    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(SpeciesCache.common_name).like(search_term),
                func.lower(SpeciesCache.scientific_name).like(search_term)
            )
        )

    species = query.order_by(SpeciesCache.fetched_at.desc()).limit(limit).all()

    return [
        {
            "id": s.id,
            "perenual_id": s.perenual_id,
            "common_name": s.common_name,
            "scientific_name": s.scientific_name,
            "watering": s.watering,
            "watering_frequency_days": s.watering_frequency_days,
            "lighting_requirement": s.lighting_requirement,
            "care_level": s.care_level,
            "poisonous_to_pets": s.poisonous_to_pets,
            "indoor": s.indoor,
            "fetched_at": s.fetched_at.isoformat() if s.fetched_at else None
        }
        for s in species
    ]
