"""WebSocket connection manager for real-time notifications."""
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manager for WebSocket connections."""

    def __init__(self):
        # Map of user_id -> set of WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept and register a WebSocket connection."""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()

        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected for user {user_id}. Total connections: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)

            # Clean up empty sets
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

            logger.info(f"WebSocket disconnected for user {user_id}")

    async def send_notification_to_user(self, user_id: int, notification: dict):
        """Send a notification to all connected clients for a user."""
        if user_id not in self.active_connections:
            logger.debug(f"No active connections for user {user_id}")
            return

        message = {
            "type": "notification",
            "data": notification
        }

        # Send to all connections for this user
        disconnected = set()
        for websocket in self.active_connections[user_id]:
            try:
                await websocket.send_json(message)
                logger.debug(f"Sent notification to user {user_id} via WebSocket")
            except Exception as e:
                logger.error(f"Error sending WebSocket message: {e}")
                disconnected.add(websocket)

        # Clean up disconnected sockets
        for ws in disconnected:
            self.disconnect(ws, user_id)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific WebSocket."""
        await websocket.send_text(message)


# Singleton instance
websocket_manager = WebSocketManager()
