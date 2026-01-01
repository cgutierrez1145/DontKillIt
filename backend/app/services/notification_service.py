"""Notification service for sending reminders."""
import logging
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from typing import List

from app.models.user import User
from app.models.plant import Plant
from app.models.watering import WateringSchedule
from app.models.feeding import FeedingSchedule
from app.models.reminder import Reminder, ReminderType

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing plant care notifications."""

    def check_and_send_reminders(self, db: Session) -> int:
        """
        Check all schedules and send reminders for overdue/upcoming care tasks.

        Returns:
            Number of reminders sent
        """
        today = date.today()
        tomorrow = today + timedelta(days=1)
        reminders_sent = 0

        # Check watering schedules
        watering_schedules = db.query(WateringSchedule).filter(
            WateringSchedule.next_watering.isnot(None),
            WateringSchedule.next_watering <= tomorrow
        ).all()

        for schedule in watering_schedules:
            plant = db.query(Plant).filter(Plant.id == schedule.plant_id).first()
            if plant:
                user = db.query(User).filter(User.id == plant.user_id).first()
                if user:
                    # Check if reminder already sent for this date
                    existing = db.query(Reminder).filter(
                        Reminder.plant_id == plant.id,
                        Reminder.reminder_type == ReminderType.WATERING,
                        Reminder.sent == True,
                        Reminder.sent_at >= datetime.now() - timedelta(days=2)
                    ).first()

                    if not existing:
                        self._send_watering_reminder(user, plant, schedule.next_watering, db)
                        reminders_sent += 1

        # Check feeding schedules
        feeding_schedules = db.query(FeedingSchedule).filter(
            FeedingSchedule.next_feeding.isnot(None),
            FeedingSchedule.next_feeding <= tomorrow
        ).all()

        for schedule in feeding_schedules:
            plant = db.query(Plant).filter(Plant.id == schedule.plant_id).first()
            if plant:
                user = db.query(User).filter(User.id == plant.user_id).first()
                if user:
                    # Check if reminder already sent for this date
                    existing = db.query(Reminder).filter(
                        Reminder.plant_id == plant.id,
                        Reminder.reminder_type == ReminderType.FEEDING,
                        Reminder.sent == True,
                        Reminder.sent_at >= datetime.now() - timedelta(days=2)
                    ).first()

                    if not existing:
                        self._send_feeding_reminder(user, plant, schedule.next_feeding, db)
                        reminders_sent += 1

        logger.info(f"Sent {reminders_sent} reminders")
        return reminders_sent

    def _send_watering_reminder(self, user: User, plant: Plant, due_date: date, db: Session):
        """Send a watering reminder."""
        days_overdue = (date.today() - due_date).days

        if days_overdue > 0:
            subject = f"🚰 Overdue: {plant.name} needs watering!"
            message = f"Your plant '{plant.name}' was due for watering {days_overdue} day(s) ago."
        elif days_overdue == 0:
            subject = f"🚰 Reminder: Water {plant.name} today"
            message = f"Your plant '{plant.name}' needs watering today!"
        else:
            subject = f"🚰 Upcoming: {plant.name} needs watering tomorrow"
            message = f"Your plant '{plant.name}' will need watering tomorrow."

        # Log to console (in production, this would send an actual email)
        logger.info(f"📧 Email to {user.email}: {subject}")
        logger.info(f"   {message}")
        print(f"\n📧 EMAIL NOTIFICATION")
        print(f"To: {user.email}")
        print(f"Subject: {subject}")
        print(f"Message: {message}\n")

        # Create reminder record
        reminder = Reminder(
            user_id=user.id,
            plant_id=plant.id,
            reminder_type=ReminderType.WATERING,
            scheduled_for=datetime.combine(due_date, datetime.min.time()),
            sent=True,
            sent_at=datetime.now()
        )
        db.add(reminder)
        db.commit()

    def _send_feeding_reminder(self, user: User, plant: Plant, due_date: date, db: Session):
        """Send a feeding reminder."""
        days_overdue = (date.today() - due_date).days

        if days_overdue > 0:
            subject = f"🌱 Overdue: {plant.name} needs feeding!"
            message = f"Your plant '{plant.name}' was due for feeding {days_overdue} day(s) ago."
        elif days_overdue == 0:
            subject = f"🌱 Reminder: Feed {plant.name} today"
            message = f"Your plant '{plant.name}' needs feeding today!"
        else:
            subject = f"🌱 Upcoming: {plant.name} needs feeding tomorrow"
            message = f"Your plant '{plant.name}' will need feeding tomorrow."

        # Log to console (in production, this would send an actual email)
        logger.info(f"📧 Email to {user.email}: {subject}")
        logger.info(f"   {message}")
        print(f"\n📧 EMAIL NOTIFICATION")
        print(f"To: {user.email}")
        print(f"Subject: {subject}")
        print(f"Message: {message}\n")

        # Create reminder record
        reminder = Reminder(
            user_id=user.id,
            plant_id=plant.id,
            reminder_type=ReminderType.FEEDING,
            scheduled_for=datetime.combine(due_date, datetime.min.time()),
            sent=True,
            sent_at=datetime.now()
        )
        db.add(reminder)
        db.commit()


# Singleton instance
notification_service = NotificationService()
