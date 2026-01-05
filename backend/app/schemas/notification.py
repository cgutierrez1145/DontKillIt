"""Notification schemas."""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, time
from app.models.notification import NotificationType, NotificationPriority, Platform


# Notification Token Schemas
class NotificationTokenCreate(BaseModel):
    """Schema for creating a notification token."""
    device_id: str
    platform: Platform
    token: str


class NotificationTokenResponse(BaseModel):
    """Schema for notification token response."""
    id: int
    device_id: str
    platform: str
    active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationCreate(BaseModel):
    """Schema for creating a notification."""
    user_id: int
    plant_id: Optional[int] = None
    notification_type: NotificationType
    title: str
    message: str
    priority: NotificationPriority = NotificationPriority.NORMAL
    data: Optional[Dict[str, Any]] = None


class NotificationResponse(BaseModel):
    """Schema for notification response."""
    id: int
    user_id: int
    plant_id: Optional[int]
    notification_type: str
    title: str
    message: str
    priority: str
    read: bool
    read_at: Optional[datetime]
    data: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    """Schema for marking notifications as read."""
    notification_ids: list[int]


# Notification Preferences Schemas
class NotificationPreferencesUpdate(BaseModel):
    """Schema for updating notification preferences."""
    push_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    watering_reminders: Optional[bool] = None
    feeding_reminders: Optional[bool] = None
    diagnosis_alerts: Optional[bool] = None
    system_notifications: Optional[bool] = None
    quiet_hours_start: Optional[time] = None
    quiet_hours_end: Optional[time] = None
    timezone: Optional[str] = None


class NotificationPreferencesResponse(BaseModel):
    """Schema for notification preferences response."""
    id: int
    user_id: int
    push_enabled: bool
    in_app_enabled: bool
    email_enabled: bool
    watering_reminders: bool
    feeding_reminders: bool
    diagnosis_alerts: bool
    system_notifications: bool
    quiet_hours_start: Optional[time]
    quiet_hours_end: Optional[time]
    timezone: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# WebSocket Message Schemas
class WebSocketMessage(BaseModel):
    """Schema for WebSocket messages."""
    type: str  # 'notification', 'ping', 'pong'
    data: Optional[Dict[str, Any]] = None
