#!/usr/bin/env python3
"""
Manual script to run plant data enrichment.

Usage:
    python run_enrichment.py              # Run full enrichment
    python run_enrichment.py --max 10     # Limit to 10 plants
    python run_enrichment.py --stats      # Show enrichment stats only
    python run_enrichment.py --reset-daily  # Reset today's API counter (for testing)

This script uses the Perenual API (100 free requests/day) to:
1. Find plants missing care data (watering schedule, lighting, etc.)
2. Fetch data from Perenual API
3. Cache species data for future use
4. Update plant records and create watering schedules

Run daily via cron or the built-in scheduler to maximize free API usage.
"""
import sys
import os
import asyncio
import argparse
from datetime import date

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

from app.database import SessionLocal, engine, Base
from app.models.enrichment import PlantEnrichment, EnrichmentLog, SpeciesCache
from app.services.data_scraper import data_scraper


def ensure_tables_exist():
    """Create enrichment tables if they don't exist."""
    # Import ALL models to register them in the correct order
    from app.models.user import User
    from app.models.plant import Plant
    from app.models.watering import WateringSchedule, WateringHistory
    from app.models.feeding import FeedingSchedule, FeedingHistory
    from app.models.photo import PlantPhoto, DiagnosisSolution
    from app.models.reminder import Reminder
    from app.models.enrichment import PlantEnrichment, EnrichmentLog, SpeciesCache

    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created.")


def show_stats():
    """Display enrichment statistics."""
    db = SessionLocal()
    try:
        stats = data_scraper.get_enrichment_stats(db)
        print("\n=== Plant Data Enrichment Statistics ===")
        print(f"Total plants with species: {stats['total_plants_with_species']}")
        print(f"Plants enriched:          {stats['plants_enriched']}")
        print(f"Plants pending:           {stats['plants_pending']}")
        print(f"Cached species:           {stats['cached_species']}")
        print(f"\n--- Today's API Usage ---")
        print(f"Requests used:            {stats['today_requests_used']}/100")
        print(f"Requests remaining:       {stats['today_requests_remaining']}")
        print(f"Status:                   {stats['today_status']}")
        print()
    finally:
        db.close()


def reset_daily_counter():
    """Reset today's API request counter (for testing)."""
    db = SessionLocal()
    try:
        log = db.query(EnrichmentLog).filter(
            EnrichmentLog.run_date == date.today()
        ).first()

        if log:
            log.perenual_requests_made = 0
            log.status = "pending"
            log.plants_processed = 0
            log.plants_enriched = 0
            log.plants_not_found = 0
            log.plants_errored = 0
            db.commit()
            print("Daily counter reset successfully.")
        else:
            print("No enrichment log found for today.")
    finally:
        db.close()


async def run_enrichment(max_plants: int = None):
    """Run the enrichment process."""
    print(f"\n=== Starting Plant Data Enrichment ===")
    if max_plants:
        print(f"Limited to {max_plants} plants")
    print()

    try:
        result = await data_scraper.run_daily_enrichment(max_plants=max_plants)

        print(f"\n=== Enrichment Complete ===")
        print(f"Status:            {result.get('status')}")
        print(f"Plants processed:  {result.get('plants_processed', 0)}")
        print(f"Plants enriched:   {result.get('plants_enriched', 0)}")
        print(f"Plants not found:  {result.get('plants_not_found', 0)}")
        print(f"Plants errored:    {result.get('plants_errored', 0)}")
        print(f"API requests used: {result.get('api_requests_used', 0)}")
        print(f"API remaining:     {result.get('api_requests_remaining', 0)}")

        if result.get('results'):
            print(f"\n--- Details ---")
            for r in result['results']:
                status = "✓" if r['success'] else "✗"
                print(f"  {status} {r['plant_name']} ({r['species']}): {r['message']}")

        print()
        return result

    except Exception as e:
        print(f"Error during enrichment: {e}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description="Run plant data enrichment from Perenual API"
    )
    parser.add_argument(
        '--max', type=int, default=None,
        help='Maximum number of plants to process'
    )
    parser.add_argument(
        '--stats', action='store_true',
        help='Show enrichment statistics only'
    )
    parser.add_argument(
        '--reset-daily', action='store_true',
        help='Reset daily API counter (for testing)'
    )

    args = parser.parse_args()

    # Ensure database tables exist
    ensure_tables_exist()

    if args.stats:
        show_stats()
        return

    if args.reset_daily:
        reset_daily_counter()
        return

    # Run enrichment
    asyncio.run(run_enrichment(max_plants=args.max))


if __name__ == "__main__":
    main()
