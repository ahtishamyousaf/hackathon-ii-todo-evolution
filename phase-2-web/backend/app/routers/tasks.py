"""
Task CRUD API endpoints.

All endpoints require JWT authentication and validate user ownership.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone, date, timedelta

from app.database import get_session
from app.models.task import Task, TaskCreate, TaskUpdate, TaskRead
from app.models.category import Category
from app.dependencies.better_auth import get_current_user_from_better_auth
from app.models.user import User
from app.schemas.bulk import BulkUpdateRequest, BulkUpdateResponse, BulkDeleteRequest, BulkDeleteResponse


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


def validate_category_ownership(
    session: Session, category_id: int | None, user_id: int
) -> None:
    """
    Validate that a category exists and belongs to the current user.

    Args:
        session: Database session
        category_id: Category ID to validate (None is valid for uncategorized)
        user_id: Current user ID

    Raises:
        HTTPException: If category doesn't exist or doesn't belong to user
    """
    if category_id is None:
        return  # Uncategorized tasks are allowed

    category = session.exec(
        select(Category).where(
            Category.id == category_id, Category.user_id == user_id
        )
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category does not exist or does not belong to you",
        )


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """
    Create a new task for the authenticated user.

    Args:
        task_data: Task creation data (title, description, completed, priority, due_date, etc.)
        session: Database session
        current_user: Authenticated user from Better Auth session

    Returns:
        Task: The created task
    """
    # Validate category ownership if provided
    validate_category_ownership(session, task_data.category_id, current_user.id)

    # Create task using authenticated user's ID
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description or "",
        completed=task_data.completed,
        priority=task_data.priority,
        due_date=task_data.due_date,
        category_id=task_data.category_id,
        is_recurring=task_data.is_recurring,
        recurrence_pattern=task_data.recurrence_pattern,
        recurrence_interval=task_data.recurrence_interval,
        recurrence_end_date=task_data.recurrence_end_date,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.get("", response_model=List[TaskRead])
async def list_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth),
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


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
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


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
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

    # Validate category ownership if being updated
    if task_data.category_id is not None:
        validate_category_ownership(session, task_data.category_id, current_user.id)

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
async def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
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

    return None


@router.patch("/{task_id}/complete", response_model=TaskRead)
async def toggle_task_complete(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """
    Toggle task completion status (complete <-> incomplete).

    Args:
        task_id: Task ID from URL path
        session: Database session
        current_user: Authenticated user from Better Auth session

    Returns:
        Task: The updated task with toggled completion status

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

    # Toggle completion status
    task.completed = not task.completed
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
        parent_task_id=task.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task


@router.post("/bulk-update", response_model=BulkUpdateResponse)
async def bulk_update_tasks(
    request: BulkUpdateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """
    Bulk update multiple tasks at once.

    Feature: 005-quick-wins-ux (US4: Bulk Task Operations)
    """
    if not request.task_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No task IDs provided"
        )

    # Get all tasks
    tasks = session.exec(
        select(Task).where(
            Task.id.in_(request.task_ids),
            Task.user_id == current_user.id
        )
    ).all()

    if len(tasks) != len(request.task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more tasks not found or not owned by user"
        )

    # Apply updates to all tasks
    updated_ids = []
    for task in tasks:
        if "completed" in request.updates:
            task.completed = request.updates["completed"]
        if "priority" in request.updates:
            task.priority = request.updates["priority"]
        if "category_id" in request.updates:
            task.category_id = request.updates["category_id"]
        if "due_date" in request.updates:
            task.due_date = request.updates["due_date"]

        task.updated_at = datetime.now(timezone.utc)
        session.add(task)
        updated_ids.append(task.id)

    session.commit()

    return BulkUpdateResponse(
        updated_count=len(updated_ids),
        task_ids=updated_ids,
        message=f"Successfully updated {len(updated_ids)} tasks"
    )


@router.post("/bulk-delete", response_model=BulkDeleteResponse)
async def bulk_delete_tasks(
    request: BulkDeleteRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """
    Bulk delete multiple tasks at once.

    Feature: 005-quick-wins-ux (US4: Bulk Task Operations)
    """
    if not request.task_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No task IDs provided"
        )

    # Get all tasks
    tasks = session.exec(
        select(Task).where(
            Task.id.in_(request.task_ids),
            Task.user_id == current_user.id
        )
    ).all()

    if len(tasks) != len(request.task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more tasks not found or not owned by user"
        )

    # Delete all tasks
    deleted_ids = []
    for task in tasks:
        # Delete task dependencies
        from app.models.task_dependency import TaskDependency
        deps = session.exec(
            select(TaskDependency).where(
                (TaskDependency.task_id == task.id) |
                (TaskDependency.depends_on_task_id == task.id)
            )
        ).all()
        for dep in deps:
            session.delete(dep)

        session.delete(task)
        deleted_ids.append(task.id)

    session.commit()

    return BulkDeleteResponse(
        deleted_count=len(deleted_ids),
        task_ids=deleted_ids,
        message=f"Successfully deleted {len(deleted_ids)} tasks"
    )


@router.put("/reorder")
async def reorder_tasks(
    task_ids: List[int],
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """
    Reorder tasks by updating their sort_order field.

    Feature: 005-quick-wins-ux (US3: Drag & Drop Task Reordering)

    Args:
        task_ids: List of task IDs in the desired order

    Returns:
        Success message with updated count
    """
    # Verify all tasks belong to user
    tasks = session.exec(
        select(Task).where(
            Task.id.in_(task_ids),
            Task.user_id == current_user.id
        )
    ).all()

    if len(tasks) != len(task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more tasks not found or not owned by user"
        )

    # Create a map of task_id to task
    task_map = {task.id: task for task in tasks}

    # Update sort_order for each task based on position in list
    for index, task_id in enumerate(task_ids):
        task = task_map[task_id]
        task.sort_order = index
        task.updated_at = datetime.now(timezone.utc)
        session.add(task)

    session.commit()

    return {
        "message": f"Successfully reordered {len(task_ids)} tasks",
        "updated_count": len(task_ids)
    }
