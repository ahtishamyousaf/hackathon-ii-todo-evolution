"""
Task Dependencies CRUD API endpoints.

All endpoints require JWT authentication and validate task ownership.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from app.database import get_session
from app.models.task_dependency import TaskDependency
from app.models.task import Task
from app.dependencies.auth import get_current_user
from app.models.user import User


# Request/Response schemas
class TaskDependencyCreate(BaseModel):
    task_id: int
    depends_on_task_id: int


class TaskDependencyResponse(BaseModel):
    id: int
    task_id: int
    depends_on_task_id: int
    depends_on_title: str
    depends_on_completed: bool


class TaskWithDependenciesResponse(BaseModel):
    task_id: int
    title: str
    completed: bool
    dependencies: List[TaskDependencyResponse]
    dependent_tasks: List[dict]  # Tasks that depend on this one


router = APIRouter(prefix="/api/task-dependencies", tags=["task-dependencies"])


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


def check_circular_dependency(
    session: Session,
    task_id: int,
    depends_on_task_id: int
) -> bool:
    """
    Check if creating this dependency would create a circular dependency.

    Args:
        session: Database session
        task_id: The task that will depend on another
        depends_on_task_id: The task that task_id will depend on

    Returns:
        bool: True if circular dependency would be created
    """
    # Can't depend on itself
    if task_id == depends_on_task_id:
        return True

    # Check if depends_on_task_id already depends on task_id (directly or indirectly)
    visited = set()
    to_check = [depends_on_task_id]

    while to_check:
        current = to_check.pop()
        if current in visited:
            continue
        visited.add(current)

        # Get all dependencies of current task
        dependencies = session.exec(
            select(TaskDependency).where(TaskDependency.task_id == current)
        ).all()

        for dep in dependencies:
            if dep.depends_on_task_id == task_id:
                return True  # Circular dependency found
            to_check.append(dep.depends_on_task_id)

    return False


@router.post("/", response_model=TaskDependency, status_code=status.HTTP_201_CREATED)
def create_dependency(
    dependency_data: TaskDependencyCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task dependency.

    Args:
        dependency_data: Dependency creation data
        session: Database session
        current_user: Authenticated user

    Returns:
        TaskDependency: The created dependency
    """
    # Validate both tasks exist and belong to user
    task = session.get(Task, dependency_data.task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    validate_task_ownership(task, current_user)

    depends_on_task = session.get(Task, dependency_data.depends_on_task_id)
    if not depends_on_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dependency task not found"
        )
    validate_task_ownership(depends_on_task, current_user)

    # Check for circular dependencies
    if check_circular_dependency(
        session,
        dependency_data.task_id,
        dependency_data.depends_on_task_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creating this dependency would create a circular dependency"
        )

    # Check if dependency already exists
    existing = session.exec(
        select(TaskDependency).where(
            TaskDependency.task_id == dependency_data.task_id,
            TaskDependency.depends_on_task_id == dependency_data.depends_on_task_id
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dependency already exists"
        )

    # Create dependency
    dependency = TaskDependency(
        task_id=dependency_data.task_id,
        depends_on_task_id=dependency_data.depends_on_task_id
    )

    session.add(dependency)
    session.commit()
    session.refresh(dependency)

    return dependency


@router.get("/task/{task_id}", response_model=TaskWithDependenciesResponse)
def get_task_dependencies(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all dependencies for a specific task.

    Args:
        task_id: ID of the task
        session: Database session
        current_user: Authenticated user

    Returns:
        TaskWithDependenciesResponse: Task with its dependencies and dependent tasks
    """
    # Validate task exists and belongs to user
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    validate_task_ownership(task, current_user)

    # Get dependencies (tasks this task depends on)
    dependencies = session.exec(
        select(TaskDependency).where(TaskDependency.task_id == task_id)
    ).all()

    dependency_responses = []
    for dep in dependencies:
        depends_on_task = session.get(Task, dep.depends_on_task_id)
        if depends_on_task:
            dependency_responses.append(
                TaskDependencyResponse(
                    id=dep.id,
                    task_id=dep.task_id,
                    depends_on_task_id=dep.depends_on_task_id,
                    depends_on_title=depends_on_task.title,
                    depends_on_completed=depends_on_task.completed
                )
            )

    # Get dependent tasks (tasks that depend on this task)
    dependent_dependencies = session.exec(
        select(TaskDependency).where(TaskDependency.depends_on_task_id == task_id)
    ).all()

    dependent_tasks = []
    for dep in dependent_dependencies:
        dependent_task = session.get(Task, dep.task_id)
        if dependent_task:
            dependent_tasks.append({
                "id": dep.id,
                "task_id": dependent_task.id,
                "task_title": dependent_task.title,
                "task_completed": dependent_task.completed
            })

    return TaskWithDependenciesResponse(
        task_id=task.id,
        title=task.title,
        completed=task.completed,
        dependencies=dependency_responses,
        dependent_tasks=dependent_tasks
    )


@router.delete("/{dependency_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dependency(
    dependency_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a task dependency.

    Args:
        dependency_id: ID of the dependency to delete
        session: Database session
        current_user: Authenticated user
    """
    dependency = session.get(TaskDependency, dependency_id)
    if not dependency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dependency not found"
        )

    # Validate task ownership
    task = session.get(Task, dependency.task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    validate_task_ownership(task, current_user)

    session.delete(dependency)
    session.commit()

    return None


@router.get("/user/all", response_model=List[TaskWithDependenciesResponse])
def get_all_user_task_dependencies(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all task dependencies for the current user.

    Args:
        session: Database session
        current_user: Authenticated user

    Returns:
        List[TaskWithDependenciesResponse]: All tasks with their dependencies
    """
    # Get all user's tasks
    tasks = session.exec(
        select(Task).where(Task.user_id == current_user.id)
    ).all()

    result = []
    for task in tasks:
        # Get dependencies for this task
        dependencies = session.exec(
            select(TaskDependency).where(TaskDependency.task_id == task.id)
        ).all()

        dependency_responses = []
        for dep in dependencies:
            depends_on_task = session.get(Task, dep.depends_on_task_id)
            if depends_on_task:
                dependency_responses.append(
                    TaskDependencyResponse(
                        id=dep.id,
                        task_id=dep.task_id,
                        depends_on_task_id=dep.depends_on_task_id,
                        depends_on_title=depends_on_task.title,
                        depends_on_completed=depends_on_task.completed
                    )
                )

        # Get dependent tasks
        dependent_dependencies = session.exec(
            select(TaskDependency).where(TaskDependency.depends_on_task_id == task.id)
        ).all()

        dependent_tasks = []
        for dep in dependent_dependencies:
            dependent_task = session.get(Task, dep.task_id)
            if dependent_task:
                dependent_tasks.append({
                    "id": dep.id,
                    "task_id": dependent_task.id,
                    "task_title": dependent_task.title,
                    "task_completed": dependent_task.completed
                })

        result.append(
            TaskWithDependenciesResponse(
                task_id=task.id,
                title=task.title,
                completed=task.completed,
                dependencies=dependency_responses,
                dependent_tasks=dependent_tasks
            )
        )

    return result
