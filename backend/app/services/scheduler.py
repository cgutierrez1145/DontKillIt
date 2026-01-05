"""Scheduler service for running periodic tasks."""
import logging
import asyncio
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)


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

    def shutdown(self):
        """Shutdown the scheduler."""
        self.scheduler.shutdown()
        logger.info("Scheduler shutdown")


# Singleton instance
scheduler_service = SchedulerService()
