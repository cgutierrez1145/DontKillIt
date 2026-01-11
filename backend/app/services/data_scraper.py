"""
Data Scraper Service - Maximizes daily free API calls for plant data enrichment.

This service runs daily to:
1. Find plants missing enrichment data
2. Fetch data from Perenual API (100 free requests/day)
3. Cache species data for reuse
4. Update plant records with care information
5. Track progress and stop when daily limit reached or all data fetched
"""
import asyncio
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.database import SessionLocal
from app.models.plant import Plant
from app.models.watering import WateringSchedule
from app.models.enrichment import PlantEnrichment, EnrichmentLog, SpeciesCache
from app.services.perenual import perenual_service
from app.utils.logging_config import get_logger

logger = get_logger(__name__)


class DataScraperService:
    """Service for scraping and enriching plant data from external APIs."""

    def __init__(self):
        self.daily_limit = 100  # Perenual free tier limit
        self.requests_used = 0

    def get_plants_needing_enrichment(self, db: Session, limit: int = 100) -> List[Plant]:
        """
        Get plants that need enrichment data.

        Prioritizes:
        1. Plants with species but no enrichment record
        2. Plants with enrichment but missing key data
        3. Plants that had errors (retry after 24h)
        """
        # Calculate sub-limits (ensure at least 1 if limit > 0)
        sub_limit = max(1, limit // 2) if limit > 0 else 50

        # Find plants with species name that don't have enrichment
        subquery = db.query(PlantEnrichment.plant_id).scalar_subquery()

        plants_without_enrichment = db.query(Plant).filter(
            Plant.species.isnot(None),
            Plant.species != '',
            ~Plant.id.in_(subquery)
        ).limit(sub_limit).all()

        # Find plants with incomplete enrichment
        plants_incomplete = db.query(Plant).join(
            PlantEnrichment, Plant.id == PlantEnrichment.plant_id
        ).filter(
            or_(
                PlantEnrichment.has_watering_data == False,
                PlantEnrichment.has_sunlight_data == False,
                PlantEnrichment.has_care_level_data == False,
            ),
            # Only retry errors after 24 hours
            or_(
                PlantEnrichment.error_count == 0,
                PlantEnrichment.updated_at < datetime.utcnow() - timedelta(hours=24)
            )
        ).limit(sub_limit).all()

        # Combine and deduplicate
        all_plants = {p.id: p for p in plants_without_enrichment}
        for p in plants_incomplete:
            if p.id not in all_plants:
                all_plants[p.id] = p

        return list(all_plants.values())[:limit]

    def get_or_create_enrichment(self, db: Session, plant_id: int) -> PlantEnrichment:
        """Get existing enrichment record or create a new one."""
        enrichment = db.query(PlantEnrichment).filter(
            PlantEnrichment.plant_id == plant_id
        ).first()

        if not enrichment:
            enrichment = PlantEnrichment(plant_id=plant_id)
            db.add(enrichment)
            db.commit()
            db.refresh(enrichment)

        return enrichment

    def check_species_cache(self, db: Session, species: str, common_name: str = None) -> Optional[SpeciesCache]:
        """Check if we have cached data for this species."""
        # Try exact scientific name match
        cache = db.query(SpeciesCache).filter(
            func.lower(SpeciesCache.scientific_name) == func.lower(species)
        ).first()

        if cache:
            return cache

        # Try common name match
        if common_name:
            cache = db.query(SpeciesCache).filter(
                func.lower(SpeciesCache.common_name) == func.lower(common_name)
            ).first()

        return cache

    def save_to_species_cache(self, db: Session, care_data: Dict[str, Any]) -> Optional[SpeciesCache]:
        """Save species data to cache for future reuse."""
        if not care_data.get('perenual_id'):
            return None

        # Check if already cached
        existing = db.query(SpeciesCache).filter(
            SpeciesCache.perenual_id == care_data['perenual_id']
        ).first()

        if existing:
            return existing

        cache = SpeciesCache(
            perenual_id=care_data['perenual_id'],
            scientific_name=care_data.get('scientific_name'),
            common_name=care_data.get('common_name'),
            watering=care_data.get('watering'),
            watering_frequency_days=care_data.get('watering_frequency_days'),
            sunlight=care_data.get('sunlight'),
            lighting_requirement=care_data.get('lighting_requirement'),
            care_level=care_data.get('care_level'),
            growth_rate=care_data.get('growth_rate'),
            maintenance=care_data.get('maintenance'),
            cycle=care_data.get('cycle'),
            hardiness_min=str(care_data.get('hardiness_min')) if care_data.get('hardiness_min') else None,
            hardiness_max=str(care_data.get('hardiness_max')) if care_data.get('hardiness_max') else None,
            drought_tolerant=care_data.get('drought_tolerant'),
            soil_types=care_data.get('soil'),
            indoor=care_data.get('indoor'),
            poisonous_to_pets=care_data.get('poisonous_to_pets'),
            poisonous_to_humans=care_data.get('poisonous_to_humans'),
            description=care_data.get('description'),
            origin=care_data.get('origin'),
            propagation=care_data.get('propagation'),
            flowering_season=care_data.get('flowering_season'),
            image_url=care_data.get('default_image'),
        )

        db.add(cache)
        db.commit()
        db.refresh(cache)
        return cache

    def apply_cache_to_enrichment(
        self,
        enrichment: PlantEnrichment,
        cache: SpeciesCache
    ) -> PlantEnrichment:
        """Apply cached species data to an enrichment record."""
        enrichment.perenual_id = cache.perenual_id
        enrichment.perenual_fetched_at = cache.fetched_at
        enrichment.scientific_name = cache.scientific_name
        enrichment.common_name = cache.common_name
        enrichment.watering_category = cache.watering
        enrichment.care_level = cache.care_level
        enrichment.growth_rate = cache.growth_rate
        enrichment.maintenance = cache.maintenance
        enrichment.cycle = cache.cycle
        enrichment.hardiness_min = cache.hardiness_min
        enrichment.hardiness_max = cache.hardiness_max
        enrichment.drought_tolerant = cache.drought_tolerant
        enrichment.soil_types = cache.soil_types
        enrichment.poisonous_to_pets = cache.poisonous_to_pets
        enrichment.poisonous_to_humans = cache.poisonous_to_humans
        enrichment.description = cache.description
        enrichment.origin = cache.origin
        enrichment.propagation_methods = cache.propagation
        enrichment.flowering_season = cache.flowering_season
        enrichment.perenual_image_url = cache.image_url

        # Update status flags
        enrichment.has_watering_data = cache.watering is not None
        enrichment.has_sunlight_data = cache.lighting_requirement is not None
        enrichment.has_care_level_data = cache.care_level is not None
        enrichment.has_toxicity_data = cache.poisonous_to_pets is not None
        enrichment.has_soil_data = cache.soil_types is not None and len(cache.soil_types or []) > 0
        enrichment.has_description = cache.description is not None

        return enrichment

    def update_plant_from_enrichment(
        self,
        db: Session,
        plant: Plant,
        enrichment: PlantEnrichment,
        cache: SpeciesCache
    ):
        """Update the plant record with enriched data."""
        # Update lighting if not set
        if not plant.lighting_requirement and cache.lighting_requirement:
            plant.lighting_requirement = cache.lighting_requirement

        # Update pet safety
        if plant.pet_friendly is None and cache.poisonous_to_pets is not None:
            plant.pet_friendly = not cache.poisonous_to_pets

        # Update soil type
        if not plant.soil_type and cache.soil_types:
            plant.soil_type = ', '.join(cache.soil_types) if isinstance(cache.soil_types, list) else str(cache.soil_types)

        # Update care summary with description
        if not plant.care_summary and cache.description:
            plant.care_summary = cache.description[:500] if len(cache.description or '') > 500 else cache.description

        # Update identified common name if not set
        if not plant.identified_common_name and cache.common_name:
            plant.identified_common_name = cache.common_name

        db.commit()

    def create_watering_schedule_if_missing(
        self,
        db: Session,
        plant_id: int,
        frequency_days: int
    ):
        """Create a watering schedule if one doesn't exist."""
        existing = db.query(WateringSchedule).filter(
            WateringSchedule.plant_id == plant_id
        ).first()

        if not existing and frequency_days:
            schedule = WateringSchedule(
                plant_id=plant_id,
                frequency_days=frequency_days,
                next_watering=date.today() + timedelta(days=frequency_days)
            )
            db.add(schedule)
            db.commit()
            logger.info(f"Created watering schedule for plant {plant_id}: every {frequency_days} days")

    async def enrich_plant(
        self,
        db: Session,
        plant: Plant,
        log: EnrichmentLog
    ) -> Tuple[bool, str]:
        """
        Enrich a single plant with data from Perenual API.

        Returns:
            Tuple of (success, message)
        """
        try:
            db.rollback()  # Ensure clean state
        except:
            pass

        enrichment = self.get_or_create_enrichment(db, plant.id)

        # Build search query
        search_query = plant.species or plant.identified_common_name or plant.name

        # Check cache first
        cache = self.check_species_cache(db, plant.species or '', plant.identified_common_name)

        if cache:
            logger.info(f"Using cached data for plant {plant.id} ({search_query})")
            enrichment = self.apply_cache_to_enrichment(enrichment, cache)
            enrichment.perenual_query_used = f"cache:{search_query}"
            db.commit()

            # Update plant record
            self.update_plant_from_enrichment(db, plant, enrichment, cache)

            # Create watering schedule
            if cache.watering_frequency_days:
                self.create_watering_schedule_if_missing(db, plant.id, cache.watering_frequency_days)

            return True, "Used cached data"

        # Check if we have API requests remaining
        if self.requests_used >= self.daily_limit:
            return False, "Daily API limit reached"

        # Fetch from Perenual API
        try:
            logger.info(f"Fetching Perenual data for plant {plant.id}: {search_query}")
            plant_data = await perenual_service.search_and_get_details(search_query)
            self.requests_used += 2  # search + details
            log.perenual_requests_made = self.requests_used

            if not plant_data:
                # Try with common name if we searched by species
                if plant.identified_common_name and search_query != plant.identified_common_name:
                    plant_data = await perenual_service.search_and_get_details(plant.identified_common_name)
                    self.requests_used += 2
                    log.perenual_requests_made = self.requests_used

            if not plant_data:
                enrichment.last_error = "No match found in Perenual"
                enrichment.error_count += 1
                db.commit()
                log.plants_not_found += 1
                return False, "No match found"

            # Parse and save the data
            care_data = perenual_service.extract_care_data(plant_data)

            # Save to cache
            cache = self.save_to_species_cache(db, care_data)

            if cache:
                # Apply to enrichment
                enrichment = self.apply_cache_to_enrichment(enrichment, cache)
                enrichment.perenual_query_used = search_query
                enrichment.error_count = 0
                enrichment.last_error = None
                db.commit()

                # Update plant record
                self.update_plant_from_enrichment(db, plant, enrichment, cache)

                # Create watering schedule
                if care_data.get('watering_frequency_days'):
                    self.create_watering_schedule_if_missing(
                        db, plant.id, care_data['watering_frequency_days']
                    )

                log.plants_enriched += 1
                return True, f"Enriched with Perenual ID {care_data.get('perenual_id')}"

            return False, "Failed to cache data"

        except Exception as e:
            logger.error(f"Error enriching plant {plant.id}: {e}")
            enrichment.last_error = str(e)
            enrichment.error_count += 1
            db.commit()
            log.plants_errored += 1
            return False, f"Error: {str(e)}"

    def get_or_create_daily_log(self, db: Session) -> EnrichmentLog:
        """Get or create the enrichment log for today."""
        today = date.today()
        log = db.query(EnrichmentLog).filter(
            EnrichmentLog.run_date == today
        ).first()

        if not log:
            log = EnrichmentLog(
                run_date=today,
                perenual_requests_limit=self.daily_limit,
                status="pending"
            )
            db.add(log)
            db.commit()
            db.refresh(log)

        return log

    async def run_daily_enrichment(self, max_plants: int = None) -> Dict[str, Any]:
        """
        Run the daily enrichment process.

        Args:
            max_plants: Maximum number of plants to process (default: use all API calls)

        Returns:
            Summary of enrichment results
        """
        db = SessionLocal()
        try:
            log = self.get_or_create_daily_log(db)

            # Check if already completed today
            if log.status == "completed":
                logger.info("Daily enrichment already completed today")
                return {
                    "status": "already_completed",
                    "message": "Daily enrichment already ran today",
                    "log_id": log.id
                }

            # Check remaining API calls
            self.requests_used = log.perenual_requests_made
            remaining = self.daily_limit - self.requests_used

            if remaining <= 0:
                logger.info("Daily API limit already reached")
                return {
                    "status": "limit_reached",
                    "message": "Daily API limit already reached",
                    "requests_used": self.requests_used
                }

            # Start the run
            log.status = "running"
            log.started_at = datetime.utcnow()
            db.commit()

            # Calculate how many plants we can process (2 API calls each worst case)
            plants_to_process = min(max_plants or remaining // 2, remaining // 2)

            # Get plants needing enrichment
            plants = self.get_plants_needing_enrichment(db, limit=plants_to_process)

            if not plants:
                logger.info("No plants need enrichment")
                log.status = "completed"
                log.completed_at = datetime.utcnow()
                db.commit()
                return {
                    "status": "no_plants",
                    "message": "All plants are already enriched",
                    "log_id": log.id
                }

            logger.info(f"Starting enrichment for {len(plants)} plants")

            # Process each plant
            results = []
            for plant in plants:
                if self.requests_used >= self.daily_limit:
                    logger.info("Daily limit reached, stopping")
                    break

                # Refresh log from database
                db.refresh(log)
                log.plants_processed += 1
                db.commit()

                # Use plant ID to refetch in clean transaction
                plant_id = plant.id
                plant_name = plant.name
                plant_species = plant.species

                success, message = await self.enrich_plant(db, plant, log)
                results.append({
                    "plant_id": plant_id,
                    "plant_name": plant_name,
                    "species": plant_species,
                    "success": success,
                    "message": message
                })

                # Delay between plants to avoid rate limiting (free tier has strict rate limits)
                await asyncio.sleep(3)

            # Complete the run
            log.status = "completed"
            log.completed_at = datetime.utcnow()
            db.commit()

            summary = {
                "status": "completed",
                "log_id": log.id,
                "plants_processed": log.plants_processed,
                "plants_enriched": log.plants_enriched,
                "plants_not_found": log.plants_not_found,
                "plants_errored": log.plants_errored,
                "api_requests_used": self.requests_used,
                "api_requests_remaining": self.daily_limit - self.requests_used,
                "results": results
            }

            logger.info(f"Enrichment complete: {summary}")
            return summary

        except Exception as e:
            logger.error(f"Enrichment run failed: {e}")
            if db:
                log = self.get_or_create_daily_log(db)
                log.status = "failed"
                log.error_message = str(e)
                log.completed_at = datetime.utcnow()
                db.commit()
            raise
        finally:
            db.close()

    def get_enrichment_stats(self, db: Session) -> Dict[str, Any]:
        """Get statistics about enrichment status."""
        total_plants = db.query(Plant).filter(
            Plant.species.isnot(None),
            Plant.species != ''
        ).count()

        enriched = db.query(PlantEnrichment).filter(
            PlantEnrichment.has_watering_data == True
        ).count()

        pending = total_plants - enriched

        cached_species = db.query(SpeciesCache).count()

        today_log = db.query(EnrichmentLog).filter(
            EnrichmentLog.run_date == date.today()
        ).first()

        return {
            "total_plants_with_species": total_plants,
            "plants_enriched": enriched,
            "plants_pending": pending,
            "cached_species": cached_species,
            "today_requests_used": today_log.perenual_requests_made if today_log else 0,
            "today_requests_remaining": self.daily_limit - (today_log.perenual_requests_made if today_log else 0),
            "today_status": today_log.status if today_log else "not_started"
        }


# Singleton instance
data_scraper = DataScraperService()
