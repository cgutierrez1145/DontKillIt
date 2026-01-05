"""Push notification service using Firebase Cloud Messaging."""
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
import httpx
from app.models.notification import NotificationToken, Platform
from app.config import settings

logger = logging.getLogger(__name__)


class PushNotificationService:
    """Service for sending push notifications via Firebase Cloud Messaging."""

    def __init__(self):
        # Using legacy FCM API for simplicity
        # For production, consider using Firebase Admin SDK with service account
        self.legacy_fcm_url = "https://fcm.googleapis.com/fcm/send"

    async def send_push_notification(
        self,
        db: Session,
        user_id: int,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        priority: str = "normal"
    ) -> Dict[str, Any]:
        """
        Send push notification to all user's devices.

        Args:
            db: Database session
            user_id: User ID to send notification to
            title: Notification title
            body: Notification body
            data: Additional data payload
            priority: 'normal' or 'high'

        Returns:
            Dictionary with send results
        """
        # Get all active tokens for user
        tokens = db.query(NotificationToken).filter(
            NotificationToken.user_id == user_id,
            NotificationToken.active == True
        ).all()

        if not tokens:
            logger.warning(f"No active tokens found for user {user_id}")
            return {"success": False, "error": "No active devices"}

        results = {
            "success": 0,
            "failed": 0,
            "errors": []
        }

        for token_obj in tokens:
            try:
                success = await self._send_to_token(
                    token=token_obj.token,
                    title=title,
                    body=body,
                    data=data,
                    platform=Platform(token_obj.platform),
                    priority=priority
                )

                if success:
                    results["success"] += 1
                    # Update last_used_at
                    token_obj.last_used_at = func.now()
                else:
                    results["failed"] += 1

            except Exception as e:
                logger.error(f"Error sending push to token {token_obj.id}: {e}")
                results["failed"] += 1
                results["errors"].append(str(e))
                # Deactivate token if it's invalid
                if "invalid" in str(e).lower() or "not registered" in str(e).lower():
                    token_obj.active = False

        db.commit()
        return results

    async def _send_to_token(
        self,
        token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]],
        platform: Platform,
        priority: str
    ) -> bool:
        """Send notification to a single FCM token."""

        if not settings.FCM_SERVER_KEY:
            logger.warning("FCM_SERVER_KEY not configured, skipping push notification")
            return False

        # Build FCM payload
        payload = {
            "to": token,
            "priority": priority,
            "notification": {
                "title": title,
                "body": body,
                "sound": "default"
            }
        }

        # Add platform-specific settings
        if platform == Platform.IOS:
            payload["notification"]["badge"] = "1"
            payload["apns"] = {
                "payload": {
                    "aps": {
                        "sound": "default",
                        "badge": 1
                    }
                }
            }
        elif platform == Platform.ANDROID:
            payload["android"] = {
                "priority": priority,
                "notification": {
                    "sound": "default",
                    "channel_id": "plant_care_reminders"
                }
            }

        # Add data payload
        if data:
            payload["data"] = {k: str(v) for k, v in data.items()}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.legacy_fcm_url,
                    json=payload,
                    headers={
                        "Authorization": f"key={settings.FCM_SERVER_KEY}",
                        "Content-Type": "application/json"
                    },
                    timeout=10.0
                )

                if response.status_code == 200:
                    result = response.json()
                    if result.get("success", 0) > 0:
                        logger.info(f"Successfully sent push notification via FCM")
                        return True
                    else:
                        logger.error(f"FCM send failed: {result}")
                        return False
                else:
                    logger.error(f"FCM request failed: {response.status_code} - {response.text}")
                    return False

        except Exception as e:
            logger.error(f"Exception sending FCM notification: {e}")
            raise

    def register_device_token(
        self,
        db: Session,
        user_id: int,
        device_id: str,
        platform: Platform,
        token: str
    ) -> NotificationToken:
        """Register or update a device token."""

        # Check if token already exists
        existing = db.query(NotificationToken).filter(
            NotificationToken.user_id == user_id,
            NotificationToken.device_id == device_id
        ).first()

        if existing:
            # Update existing token
            existing.token = token
            existing.platform = platform.value
            existing.active = True
            existing.updated_at = func.now()
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new token
            new_token = NotificationToken(
                user_id=user_id,
                device_id=device_id,
                platform=platform.value,
                token=token,
                active=True
            )
            db.add(new_token)
            db.commit()
            db.refresh(new_token)
            return new_token

    def unregister_device_token(
        self,
        db: Session,
        user_id: int,
        device_id: str
    ) -> bool:
        """Deactivate a device token."""
        token = db.query(NotificationToken).filter(
            NotificationToken.user_id == user_id,
            NotificationToken.device_id == device_id
        ).first()

        if token:
            token.active = False
            db.commit()
            return True
        return False


# Singleton instance
push_notification_service = PushNotificationService()
