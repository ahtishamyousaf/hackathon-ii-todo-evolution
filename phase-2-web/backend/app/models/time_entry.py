"""
Time Entry Model

Tracks time spent on tasks with start/stop times and manual entries.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class TimeEntry(SQLModel, table=True):
    """
    Time entry for tracking time spent on tasks.

    Supports both timer-based tracking (start/stop) and manual time entry.
    """
    __tablename__ = "time_entries"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    # Time tracking
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = Field(default=None)  # None means timer is running
    duration: Optional[int] = Field(default=None)  # Duration in seconds (calculated or manual)

    # Optional description for the time entry
    description: Optional[str] = Field(default=None, max_length=500)

    # Metadata
    is_manual: bool = Field(default=False)  # True if manually entered, False if from timer
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def calculate_duration(self) -> Optional[int]:
        """Calculate duration in seconds if both start and end times are set."""
        if self.end_time:
            # Ensure both datetimes are timezone-aware for proper subtraction
            start = self.start_time if self.start_time.tzinfo else self.start_time.replace(tzinfo=timezone.utc)
            end = self.end_time if self.end_time.tzinfo else self.end_time.replace(tzinfo=timezone.utc)
            delta = end - start
            return int(delta.total_seconds())
        return None

    def is_running(self) -> bool:
        """Check if the timer is currently running."""
        return self.end_time is None and not self.is_manual
