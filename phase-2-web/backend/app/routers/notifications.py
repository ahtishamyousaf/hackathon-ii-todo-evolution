"""
Notification API Router

Provides endpoints for managing user notifications and WebSocket connections.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from app.models.notification import Notification
from app.models.user import User
from app.database import get_session
from app.dependencies.better_auth import get_current_user_from_better_auth
from datetime import datetime, timezone


router = APIRouter(prefix="/api/notifications", tags=["notifications"])


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_notification(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except:
                self.disconnect(user_id)


manager = ConnectionManager()


@router.get("/", response_model=List[Notification])
def get_notifications(
    unread_only: bool = False,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Get notifications for the current user."""
    query = select(Notification).where(Notification.user_id == current_user.id)

    if unread_only:
        query = query.where(Notification.read == False)

    notifications = session.exec(
        query.order_by(Notification.created_at.desc())
    ).all()

    return notifications


@router.post("/{notification_id}/read", response_model=Notification)
def mark_as_read(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Mark a notification as read."""
    notification = session.get(Notification, notification_id)

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this notification"
        )

    notification.read = True
    session.add(notification)
    session.commit()
    session.refresh(notification)

    return notification


@router.post("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_as_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Mark all notifications as read."""
    notifications = session.exec(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.read == False
        )
    ).all()

    for notification in notifications:
        notification.read = True
        session.add(notification)

    session.commit()
    return None


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Delete a notification."""
    notification = session.get(Notification, notification_id)

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this notification"
        )

    session.delete(notification)
    session.commit()

    return None


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket endpoint for real-time notifications."""
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection alive and receive any messages from client
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id)


# Helper function to create and send notifications
async def create_notification(
    session: Session,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    related_task_id: int = None,
    related_user_id: int = None
):
    """Create a notification and send via WebSocket if user is connected."""
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        related_task_id=related_task_id,
        related_user_id=related_user_id
    )

    session.add(notification)
    session.commit()
    session.refresh(notification)

    # Send via WebSocket if connected
    await manager.send_notification(user_id, {
        "id": notification.id,
        "type": notification_type,
        "title": title,
        "message": message,
        "created_at": notification.created_at.isoformat()
    })

    return notification
