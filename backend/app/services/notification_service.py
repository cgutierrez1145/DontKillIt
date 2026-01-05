"""Enhanced notification service for sending reminders via multiple channels."""
import logging
from datetime import datetime, date, timedelta, time as dt_time
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.models.user import User
from app.models.plant import Plant
from app.models.watering import WateringSchedule
from app.models.feeding import FeedingSchedule
from app.models.reminder import Reminder, ReminderType
from app.models.notification import (
    Notification,
    NotificationPreferences,
    NotificationType,
    NotificationPriority
)
from app.services.push_notification_service import push_notification_service
from app.services.websocket_manager import websocket_manager

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing plant care notifications across multiple channels."""

    def __init__(self):
        self.websocket_manager = websocket_manager

    async def check_and_send_reminders(self, db: Session) -> int:
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
                        await self._send_watering_reminder(user, plant, schedule.next_watering, db)
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
                        await self._send_feeding_reminder(user, plant, schedule.next_feeding, db)
                        reminders_sent += 1

        logger.info(f"Sent {reminders_sent} reminders")
        return reminders_sent

    async def _send_watering_reminder(self, user: User, plant: Plant, due_date: date, db: Session):
        """Send a watering reminder via all enabled channels."""
        days_overdue = (date.today() - due_date).days

        if days_overdue > 0:
            title = f"Overdue: {plant.name} needs watering!"
            message = f"Your plant '{plant.name}' was due for watering {days_overdue} day(s) ago."
            priority = NotificationPriority.HIGH
        elif days_overdue == 0:
            title = f"Reminder: Water {plant.name} today"
            message = f"Your plant '{plant.name}' needs watering today!"
            priority = NotificationPriority.NORMAL
        else:
            title = f"Upcoming: {plant.name} needs watering tomorrow"
            message = f"Your plant '{plant.name}' will need watering tomorrow."
            priority = NotificationPriority.NORMAL

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
        db.flush()  # Get reminder ID

        # Send notifications via enabled channels
        await self._send_multi_channel_notification(
            db=db,
            user=user,
            plant_id=plant.id,
            notification_type=NotificationType.WATERING,
            title=title,
            message=message,
            priority=priority,
            reminder=reminder,
            data={
                "plant_id": plant.id,
                "plant_name": plant.name,
                "reminder_type": "watering",
                "due_date": due_date.isoformat(),
                "deep_link": f"/plants/{plant.id}"
            }
        )

        db.commit()

    async def _send_feeding_reminder(self, user: User, plant: Plant, due_date: date, db: Session):
        """Send a feeding reminder via all enabled channels."""
        days_overdue = (date.today() - due_date).days

        if days_overdue > 0:
            title = f"Overdue: {plant.name} needs feeding!"
            message = f"Your plant '{plant.name}' was due for feeding {days_overdue} day(s) ago."
            priority = NotificationPriority.HIGH
        elif days_overdue == 0:
            title = f"Reminder: Feed {plant.name} today"
            message = f"Your plant '{plant.name}' needs feeding today!"
            priority = NotificationPriority.NORMAL
        else:
            title = f"Upcoming: {plant.name} needs feeding tomorrow"
            message = f"Your plant '{plant.name}' will need feeding tomorrow."
            priority = NotificationPriority.NORMAL

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
        db.flush()

        # Send notifications via enabled channels
        await self._send_multi_channel_notification(
            db=db,
            user=user,
            plant_id=plant.id,
            notification_type=NotificationType.FEEDING,
            title=title,
            message=message,
            priority=priority,
            reminder=reminder,
            data={
                "plant_id": plant.id,
                "plant_name": plant.name,
                "reminder_type": "feeding",
                "due_date": due_date.isoformat(),
                "deep_link": f"/plants/{plant.id}"
            }
        )

        db.commit()

    async def _send_multi_channel_notification(
        self,
        db: Session,
        user: User,
        plant_id: Optional[int],
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority,
        reminder: Optional[Reminder] = None,
        data: Optional[Dict[str, Any]] = None
    ):
        """Send notification via multiple channels based on user preferences."""

        # Get user preferences
        prefs = self._get_user_preferences(db, user.id)

        # Check if notification type is enabled
        if not self._is_notification_type_enabled(prefs, notification_type):
            logger.info(f"Notification type {notification_type} disabled for user {user.id}")
            return

        # Check quiet hours
        if self._is_quiet_hours(prefs):
            logger.info(f"Skipping notification for user {user.id} (quiet hours)")
            return

        # Create in-app notification
        in_app_notification = None
        if prefs.in_app_enabled:
            in_app_notification = Notification(
                user_id=user.id,
                plant_id=plant_id,
                notification_type=notification_type.value,
                title=title,
                message=message,
                priority=priority.value,
                data=data
            )
            db.add(in_app_notification)
            db.flush()

            # Link to reminder if provided
            if reminder:
                reminder.in_app_notification_id = in_app_notification.id

            # Send via WebSocket if user is connected
            try:
                await self.websocket_manager.send_notification_to_user(
                    user_id=user.id,
                    notification={
                        "id": in_app_notification.id,
                        "type": notification_type.value,
                        "title": title,
                        "message": message,
                        "priority": priority.value,
                        "data": data,
                        "created_at": in_app_notification.created_at.isoformat() if in_app_notification.created_at else datetime.now().isoformat()
                    }
                )
            except Exception as e:
                logger.error(f"Error sending WebSocket notification: {e}")

        # Send push notification
        if prefs.push_enabled:
            try:
                result = await push_notification_service.send_push_notification(
                    db=db,
                    user_id=user.id,
                    title=title,
                    body=message,
                    data=data,
                    priority="high" if priority == NotificationPriority.HIGH else "normal"
                )

                if reminder:
                    if result.get("success", 0) > 0:
                        reminder.push_sent = True
                        reminder.push_sent_at = datetime.now()
                    else:
                        reminder.delivery_error = str(result.get("errors", []))

            except Exception as e:
                logger.error(f"Error sending push notification: {e}")
                if reminder:
                    reminder.delivery_error = str(e)

        db.commit()

    def _get_user_preferences(self, db: Session, user_id: int) -> NotificationPreferences:
        """Get user notification preferences, create default if not exists."""
        prefs = db.query(NotificationPreferences).filter(
            NotificationPreferences.user_id == user_id
        ).first()

        if not prefs:
            # Create default preferences
            prefs = NotificationPreferences(user_id=user_id)
            db.add(prefs)
            db.commit()
            db.refresh(prefs)

        return prefs

    def _is_notification_type_enabled(
        self,
        prefs: NotificationPreferences,
        notification_type: NotificationType
    ) -> bool:
        """Check if a specific notification type is enabled."""
        type_map = {
            NotificationType.WATERING: prefs.watering_reminders,
            NotificationType.FEEDING: prefs.feeding_reminders,
            NotificationType.DIAGNOSIS: prefs.diagnosis_alerts,
            NotificationType.SYSTEM: prefs.system_notifications
        }
        return type_map.get(notification_type, True)

    def _is_quiet_hours(self, prefs: NotificationPreferences) -> bool:
        """Check if current time is within quiet hours."""
        if not prefs.quiet_hours_start or not prefs.quiet_hours_end:
            return False

        # Get current time in user's timezone (simplified - just use UTC for now)
        now = datetime.now().time()

        start = prefs.quiet_hours_start
        end = prefs.quiet_hours_end

        # Handle overnight quiet hours (e.g., 22:00 - 08:00)
        if start > end:
            return now >= start or now < end
        else:
            return start <= now < end


# Singleton instance
notification_service = NotificationService()
