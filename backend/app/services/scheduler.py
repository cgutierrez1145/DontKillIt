"""Scheduler service for running periodic tasks."""
import logging
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)

# Import data scraper lazily to avoid circular imports
_data_scraper = None


def get_data_scraper():
    """Lazy import of data scraper to avoid circular imports."""
    global _data_scraper
    if _data_scraper is None:
        from app.services.data_scraper import data_scraper
        _data_scraper = data_scraper
    return _data_scraper


class SchedulerService:
    """Service for managing scheduled tasks."""

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        logger.info("Scheduler started")

    def start_reminder_job(self):
        """Start the daily reminder check job."""
        # Run daily at 9:00 AM
        self.scheduler.add_job(
            func=self.check_reminders,
            trigger=CronTrigger(hour=9, minute=0),
            id='check_reminders',
            name='Check and send plant care reminders',
            replace_existing=True
        )
        logger.info("Reminder job scheduled for 9:00 AM daily")

    def start_enrichment_job(self):
        """Start the daily plant data enrichment job."""
        # Run daily at 2:00 AM to maximize API calls
        self.scheduler.add_job(
            func=self.run_daily_enrichment,
            trigger=CronTrigger(hour=2, minute=0),
            id='daily_enrichment',
            name='Enrich plant data from Perenual API',
            replace_existing=True
        )
        logger.info("Enrichment job scheduled for 2:00 AM daily")

    def run_daily_enrichment(self):
        """Run daily plant data enrichment - called by scheduler."""
        logger.info("Running scheduled plant data enrichment...")
        try:
            scraper = get_data_scraper()
            result = asyncio.run(scraper.run_daily_enrichment())
            logger.info(f"Enrichment complete: {result.get('plants_enriched', 0)} plants enriched")
        except Exception as e:
            logger.error(f"Error in enrichment job: {e}")

    def check_reminders(self):
        """Check and send reminders - called by scheduler."""
        logger.info("Running scheduled reminder check...")
        db = SessionLocal()
        try:
            # Run async function in sync context
            count = asyncio.run(notification_service.check_and_send_reminders(db))
            logger.info(f"Reminder check complete. Sent {count} reminders.")
        except Exception as e:
            logger.error(f"Error in reminder check: {e}")
        finally:
            db.close()

    async def trigger_reminder_check_now(self):
        """Manually trigger reminder check (for testing)."""
        logger.info("Manual reminder check triggered")
        db = SessionLocal()
        try:
            count = await notification_service.check_and_send_reminders(db)
            return {"success": True, "reminders_sent": count}
        except Exception as e:
            logger.error(f"Error in manual reminder check: {e}")
            return {"success": False, "error": str(e)}
        finally:
            db.close()

    async def trigger_enrichment_now(self, max_plants: int = None):
        """Manually trigger plant data enrichment (for testing or manual runs)."""
        logger.info("Manual enrichment triggered")
        try:
            scraper = get_data_scraper()
            result = await scraper.run_daily_enrichment(max_plants=max_plants)
            return {"success": True, **result}
        except Exception as e:
            logger.error(f"Error in manual enrichment: {e}")
            return {"success": False, "error": str(e)}

    def shutdown(self):
        """Shutdown the scheduler."""
        self.scheduler.shutdown()
        logger.info("Scheduler shutdown")


# Singleton instance
scheduler_service = SchedulerService()
