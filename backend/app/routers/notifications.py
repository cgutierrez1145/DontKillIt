"""Notification API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.utils.auth import get_current_user, get_websocket_user
from app.models.user import User
from app.models.notification import Notification, NotificationPreferences, NotificationToken
from app.schemas.notification import (
    NotificationResponse,
    NotificationMarkRead,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
    NotificationTokenCreate,
    NotificationTokenResponse
)
from app.services.websocket_manager import websocket_manager
from app.services.push_notification_service import push_notification_service

router = APIRouter()


# ========== WebSocket Endpoint ==========

@router.websocket("/ws/notifications")
async def websocket_notifications_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time notifications."""
    # Authenticate user from token
    user = await get_websocket_user(token, db)
    if not user:
        await websocket.close(code=1008)  # Policy violation
        return

    # Connect WebSocket
    await websocket_manager.connect(websocket, user.id)

    try:
        while True:
            # Keep connection alive and handle pings
            data = await websocket.receive_json()

            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, user.id)


# ========== In-App Notifications Endpoints ==========

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notifications."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.read == False)

    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/notifications/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications."""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).count()

    return {"count": count}


@router.post("/notifications/mark-read")
async def mark_notifications_read(
    payload: NotificationMarkRead,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notifications as read."""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.id.in_(payload.notification_ids)
    ).all()

    for notification in notifications:
        notification.read = True
        notification.read_at = datetime.now()

    db.commit()

    return {"success": True, "marked": len(notifications)}


@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read."""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).update({
        "read": True,
        "read_at": datetime.now()
    })

    db.commit()

    return {"success": True, "marked": count}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()

    return {"success": True}


# ========== Notification Preferences Endpoints ==========

@router.get("/notifications/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notification preferences."""
    prefs = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()

    if not prefs:
        # Create default preferences
        prefs = NotificationPreferences(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return prefs


@router.put("/notifications/preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's notification preferences."""
    prefs = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()

    if not prefs:
        prefs = NotificationPreferences(user_id=current_user.id)
        db.add(prefs)

    # Update fields
    for field, value in preferences.dict(exclude_unset=True).items():
        setattr(prefs, field, value)

    prefs.updated_at = datetime.now()
    db.commit()
    db.refresh(prefs)

    return prefs


# ========== Push Notification Token Endpoints ==========

@router.post("/notifications/tokens", response_model=NotificationTokenResponse)
async def register_push_token(
    token_data: NotificationTokenCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register a device token for push notifications."""
    token = push_notification_service.register_device_token(
        db=db,
        user_id=current_user.id,
        device_id=token_data.device_id,
        platform=token_data.platform,
        token=token_data.token
    )

    return token


@router.get("/notifications/tokens", response_model=List[NotificationTokenResponse])
async def get_push_tokens(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all registered device tokens."""
    tokens = db.query(NotificationToken).filter(
        NotificationToken.user_id == current_user.id
    ).all()

    return tokens


@router.delete("/notifications/tokens/{device_id}")
async def unregister_push_token(
    device_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unregister a device token."""
    success = push_notification_service.unregister_device_token(
        db=db,
        user_id=current_user.id,
        device_id=device_id
    )

    if not success:
        raise HTTPException(status_code=404, detail="Token not found")

    return {"success": True}
