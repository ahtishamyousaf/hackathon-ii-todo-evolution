"""
Task CRUD API endpoints.

All endpoints require JWT authentication and validate user ownership.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone, date, timedelta
from pydantic import BaseModel

from app.database import get_session
from app.models.task import Task
from app.dependencies.auth import get_current_user
from app.models.user import User


# Request/Response schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: str = "medium"  # low, medium, high
    due_date: Optional[date] = None
    category_id: Optional[int] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None  # daily, weekly, monthly
    recurrence_interval: Optional[int] = 1
    recurrence_end_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None  # low, medium, high
    due_date: Optional[date] = None
    category_id: Optional[int] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    recurrence_interval: Optional[int] = None
    recurrence_end_date: Optional[date] = None


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def validate_task_ownership(task: Task, user: User) -> None:
    """
    Validate that the task belongs to the current user.

    Raises:
        HTTPException: 403 if task doesn't belong to user
    """
    if task.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task for the authenticated user.

    Args:
        task_data: Task creation data (title, description, completed)
        session: Database session
        current_user: Authenticated user from Better Auth session

    Returns:
        Task: The created task
    """
    # Create task using authenticated user's ID
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        completed=task_data.completed,
        priority=task_data.priority,
        due_date=task_data.due_date,
        category_id=task_data.category_id,
        is_recurring=task_data.is_recurring,
        recurrence_pattern=task_data.recurrence_pattern,
        recurrence_interval=task_data.recurrence_interval,
        recurrence_end_date=task_data.recurrence_end_date
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.get("/", response_model=List[Task])
def list_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    priority: Optional[str] = None,
    completed: Optional[bool] = None,
    is_recurring: Optional[bool] = None,
    due_date_from: Optional[date] = None,
    due_date_to: Optional[date] = None,
    overdue_only: Optional[bool] = None
):
    """
    Get all tasks for the authenticated user with optional filtering.

    Args:
        session: Database session
        current_user: Authenticated user from JWT
        search: Search text in title and description
        category_id: Filter by category ID
        priority: Filter by priority (low, medium, high)
        completed: Filter by completion status
        is_recurring: Filter recurring tasks
        due_date_from: Filter tasks due on or after this date
        due_date_to: Filter tasks due on or before this date
        overdue_only: Show only overdue tasks

    Returns:
        List[Task]: Filtered list of tasks for the authenticated user
    """
    # Start with base query for authenticated user
    statement = select(Task).where(Task.user_id == current_user.id)

    # Apply text search filter
    if search:
        search_term = f"%{search}%"
        statement = statement.where(
            (Task.title.ilike(search_term)) | (Task.description.ilike(search_term))
        )

    # Apply category filter
    if category_id is not None:
        statement = statement.where(Task.category_id == category_id)

    # Apply priority filter
    if priority:
        statement = statement.where(Task.priority == priority)

    # Apply completion status filter
    if completed is not None:
        statement = statement.where(Task.completed == completed)

    # Apply recurring filter
    if is_recurring is not None:
        statement = statement.where(Task.is_recurring == is_recurring)

    # Apply due date range filters
    if due_date_from:
        statement = statement.where(Task.due_date >= due_date_from)
    if due_date_to:
        statement = statement.where(Task.due_date <= due_date_to)

    # Apply overdue filter
    if overdue_only:
        today = date.today()
        statement = statement.where(
            (Task.due_date < today) & (Task.completed == False)
        )

    # Order by created date descending
    statement = statement.order_by(Task.created_at.desc())

    tasks = session.exec(statement).all()

    return tasks


@router.get("/{task_id}", response_model=Task)
def get_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific task.

    Args:
        task_id: Task ID from URL path
        session: Database session
        current_user: Authenticated user from JWT

    Returns:
        Task: The requested task

    Raises:
        HTTPException: 403 if task doesn't belong to user
        HTTPException: 404 if task not found
    """
    # Get task
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Validate ownership
    validate_task_ownership(task, current_user)

    return task


@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update a task.

    Args:
        task_id: Task ID from URL path
        task_data: Task update data
        session: Database session
        current_user: Authenticated user from Better Auth session

    Returns:
        Task: The updated task

    Raises:
        HTTPException: 403 if task doesn't belong to user
        HTTPException: 404 if task not found
    """
    # Get task
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Validate ownership
    validate_task_ownership(task, current_user)

    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.due_date is not None:
        task.due_date = task_data.due_date
    if task_data.category_id is not None:
        task.category_id = task_data.category_id
    if task_data.is_recurring is not None:
        task.is_recurring = task_data.is_recurring
    if task_data.recurrence_pattern is not None:
        task.recurrence_pattern = task_data.recurrence_pattern
    if task_data.recurrence_interval is not None:
        task.recurrence_interval = task_data.recurrence_interval
    if task_data.recurrence_end_date is not None:
        task.recurrence_end_date = task_data.recurrence_end_date

    task.updated_at = datetime.now(timezone.utc)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a task and all its related dependencies.

    Args:
        task_id: Task ID from URL path
        session: Database session
        current_user: Authenticated user from JWT

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 403 if task doesn't belong to user
        HTTPException: 404 if task not found
    """
    # Get task
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Validate ownership
    validate_task_ownership(task, current_user)

    # First, delete all task dependencies where this task is involved
    # Import TaskDependency model
    from app.models.task_dependency import TaskDependency

    # Delete dependencies where this task depends on others
    deps_as_task = session.exec(
        select(TaskDependency).where(TaskDependency.task_id == task_id)
    ).all()
    for dep in deps_as_task:
        session.delete(dep)

    # Delete dependencies where other tasks depend on this one
    deps_as_dependency = session.exec(
        select(TaskDependency).where(TaskDependency.depends_on_task_id == task_id)
    ).all()
    for dep in deps_as_dependency:
        session.delete(dep)

    # Now delete the task
    session.delete(task)
    session.commit()


class TaskCompletionUpdate(BaseModel):
    completed: bool


@router.patch("/{task_id}", response_model=Task)
def toggle_task_completion(
    task_id: int,
    update_data: TaskCompletionUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update task completion status.

    Args:
        task_id: Task ID from URL path
        update_data: Completion status update data
        session: Database session
        current_user: Authenticated user from Better Auth session

    Returns:
        Task: The updated task with new completion status

    Raises:
        HTTPException: 403 if task doesn't belong to user
        HTTPException: 404 if task not found
    """
    # Get task
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Validate ownership
    validate_task_ownership(task, current_user)

    # Update completion status
    task.completed = update_data.completed
    task.updated_at = datetime.now(timezone.utc)

    session.add(task)
    session.commit()
    session.refresh(task)

    # If this is a recurring task that was just completed, generate the next occurrence
    if task.completed and task.is_recurring and task.recurrence_pattern:
        generate_next_occurrence(task, session)

    return task


def generate_next_occurrence(task: Task, session: Session) -> Optional[Task]:
    """
    Generate the next occurrence of a recurring task.

    Args:
        task: The completed recurring task
        session: Database session

    Returns:
        The new task instance or None if recurrence has ended
    """
    if not task.due_date:
        return None

    # Calculate next due date based on pattern
    next_due_date = task.due_date
    interval = task.recurrence_interval or 1

    if task.recurrence_pattern == "daily":
        next_due_date = task.due_date + timedelta(days=interval)
    elif task.recurrence_pattern == "weekly":
        next_due_date = task.due_date + timedelta(weeks=interval)
    elif task.recurrence_pattern == "monthly":
        # Add months (approximate with 30 days)
        next_due_date = task.due_date + timedelta(days=30 * interval)

    # Check if we've passed the end date
    if task.recurrence_end_date and next_due_date > task.recurrence_end_date:
        return None

    # Create new task instance
    new_task = Task(
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=False,
        priority=task.priority,
        due_date=next_due_date,
        category_id=task.category_id,
        is_recurring=True,
        recurrence_pattern=task.recurrence_pattern,
        recurrence_interval=task.recurrence_interval,
        recurrence_end_date=task.recurrence_end_date,
        parent_task_id=task.id
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task
