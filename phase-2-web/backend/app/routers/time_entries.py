"""
Time Entry API Router

Provides endpoints for time tracking on tasks.
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel

from app.models.time_entry import TimeEntry
from app.models.task import Task
from app.models.user import User
from app.database import get_session
from app.dependencies.better_auth import get_current_user_from_better_auth


router = APIRouter(prefix="/api/time-entries", tags=["time-tracking"])


# Pydantic schemas
class TimeEntryCreate(BaseModel):
    """Schema for creating a time entry."""
    task_id: int
    description: Optional[str] = None


class TimeEntryManual(BaseModel):
    """Schema for manual time entry."""
    task_id: int
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None


class TimeEntryUpdate(BaseModel):
    """Schema for updating a time entry."""
    description: Optional[str] = None


class TimeEntryResponse(BaseModel):
    """Response schema for time entry."""
    id: int
    task_id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration: Optional[int]
    description: Optional[str]
    is_manual: bool
    is_running: bool
    created_at: datetime


@router.post("/start", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
def start_timer(
    data: TimeEntryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """
    Start a timer for a task.

    Only one timer can be running at a time per user.
    """
    # Verify task exists and belongs to user
    task = session.get(Task, data.task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to track time on this task"
        )

    # Check if user already has a running timer
    running_timer = session.exec(
        select(TimeEntry).where(
            TimeEntry.user_id == current_user.id,
            TimeEntry.end_time == None,
            TimeEntry.is_manual == False
        )
    ).first()

    if running_timer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Timer already running for task {running_timer.task_id}. Stop it first."
        )

    # Create new time entry
    entry = TimeEntry(
        task_id=data.task_id,
        user_id=current_user.id,
        description=data.description,
        is_manual=False
    )

    session.add(entry)
    session.commit()
    session.refresh(entry)

    return TimeEntryResponse(
        id=entry.id,
        task_id=entry.task_id,
        user_id=entry.user_id,
        start_time=entry.start_time,
        end_time=entry.end_time,
        duration=entry.duration,
        description=entry.description,
        is_manual=entry.is_manual,
        is_running=entry.is_running(),
        created_at=entry.created_at
    )


@router.post("/stop/{entry_id}", response_model=TimeEntryResponse)
def stop_timer(
    entry_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Stop a running timer."""
    entry = session.get(TimeEntry, entry_id)

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )

    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this time entry"
        )

    if entry.end_time is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Timer already stopped"
        )

    # Stop the timer
    entry.end_time = datetime.now(timezone.utc)
    entry.duration = entry.calculate_duration()
    entry.updated_at = datetime.now(timezone.utc)

    session.add(entry)
    session.commit()
    session.refresh(entry)

    return TimeEntryResponse(
        id=entry.id,
        task_id=entry.task_id,
        user_id=entry.user_id,
        start_time=entry.start_time,
        end_time=entry.end_time,
        duration=entry.duration,
        description=entry.description,
        is_manual=entry.is_manual,
        is_running=entry.is_running(),
        created_at=entry.created_at
    )


@router.post("/manual", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
def add_manual_entry(
    data: TimeEntryManual,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Add a manual time entry."""
    # Verify task exists and belongs to user
    task = session.get(Task, data.task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to track time on this task"
        )

    # Validate times
    if data.end_time <= data.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )

    # Calculate duration
    duration = int((data.end_time - data.start_time).total_seconds())

    # Create manual entry
    entry = TimeEntry(
        task_id=data.task_id,
        user_id=current_user.id,
        start_time=data.start_time,
        end_time=data.end_time,
        duration=duration,
        description=data.description,
        is_manual=True
    )

    session.add(entry)
    session.commit()
    session.refresh(entry)

    return TimeEntryResponse(
        id=entry.id,
        task_id=entry.task_id,
        user_id=entry.user_id,
        start_time=entry.start_time,
        end_time=entry.end_time,
        duration=entry.duration,
        description=entry.description,
        is_manual=entry.is_manual,
        is_running=entry.is_running(),
        created_at=entry.created_at
    )


@router.get("/task/{task_id}", response_model=List[TimeEntryResponse])
def get_task_time_entries(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Get all time entries for a task."""
    # Verify task exists and belongs to user
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this task's time entries"
        )

    # Get entries
    entries = session.exec(
        select(TimeEntry)
        .where(TimeEntry.task_id == task_id)
        .order_by(TimeEntry.start_time.desc())
    ).all()

    return [
        TimeEntryResponse(
            id=entry.id,
            task_id=entry.task_id,
            user_id=entry.user_id,
            start_time=entry.start_time,
            end_time=entry.end_time,
            duration=entry.duration,
            description=entry.description,
            is_manual=entry.is_manual,
            is_running=entry.is_running(),
            created_at=entry.created_at
        )
        for entry in entries
    ]


@router.get("/running", response_model=Optional[TimeEntryResponse])
def get_running_timer(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Get the currently running timer for the user."""
    entry = session.exec(
        select(TimeEntry).where(
            TimeEntry.user_id == current_user.id,
            TimeEntry.end_time == None,
            TimeEntry.is_manual == False
        )
    ).first()

    if not entry:
        return None

    return TimeEntryResponse(
        id=entry.id,
        task_id=entry.task_id,
        user_id=entry.user_id,
        start_time=entry.start_time,
        end_time=entry.end_time,
        duration=entry.duration,
        description=entry.description,
        is_manual=entry.is_manual,
        is_running=entry.is_running(),
        created_at=entry.created_at
    )


@router.get("/", response_model=List[TimeEntryResponse])
def get_user_time_entries(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Get all time entries for the current user."""
    entries = session.exec(
        select(TimeEntry)
        .where(TimeEntry.user_id == current_user.id)
        .order_by(TimeEntry.start_time.desc())
    ).all()

    return [
        TimeEntryResponse(
            id=entry.id,
            task_id=entry.task_id,
            user_id=entry.user_id,
            start_time=entry.start_time,
            end_time=entry.end_time,
            duration=entry.duration,
            description=entry.description,
            is_manual=entry.is_manual,
            is_running=entry.is_running(),
            created_at=entry.created_at
        )
        for entry in entries
    ]


@router.put("/{entry_id}", response_model=TimeEntryResponse)
def update_time_entry(
    entry_id: int,
    data: TimeEntryUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Update a time entry's description."""
    entry = session.get(TimeEntry, entry_id)

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )

    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this time entry"
        )

    if data.description is not None:
        entry.description = data.description

    entry.updated_at = datetime.now(timezone.utc)

    session.add(entry)
    session.commit()
    session.refresh(entry)

    return TimeEntryResponse(
        id=entry.id,
        task_id=entry.task_id,
        user_id=entry.user_id,
        start_time=entry.start_time,
        end_time=entry.end_time,
        duration=entry.duration,
        description=entry.description,
        is_manual=entry.is_manual,
        is_running=entry.is_running(),
        created_at=entry.created_at
    )


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_time_entry(
    entry_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Delete a time entry."""
    entry = session.get(TimeEntry, entry_id)

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found"
        )

    if entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this time entry"
        )

    session.delete(entry)
    session.commit()

    return None
