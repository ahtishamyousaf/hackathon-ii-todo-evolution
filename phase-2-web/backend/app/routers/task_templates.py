"""
Task Template API Router

Provides endpoints for managing task templates.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel

from app.models.task_template import TaskTemplate
from app.models.task import Task
from app.models.user import User
from app.database import get_session
from app.dependencies.better_auth import get_current_user_from_better_auth


router = APIRouter(prefix="/api/templates", tags=["templates"])


# Pydantic schemas
class TemplateCreate(BaseModel):
    """Schema for creating a template."""
    name: str
    description: Optional[str] = None
    template_data: Dict[str, Any]


class TemplateUpdate(BaseModel):
    """Schema for updating a template."""
    name: Optional[str] = None
    description: Optional[str] = None
    template_data: Optional[Dict[str, Any]] = None


@router.post("/", response_model=TaskTemplate, status_code=status.HTTP_201_CREATED)
def create_template(
    data: TemplateCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Create a new task template."""
    template = TaskTemplate(
        user_id=current_user.id,
        name=data.name,
        description=data.description,
        template_data=data.template_data
    )

    session.add(template)
    session.commit()
    session.refresh(template)

    return template


@router.get("/", response_model=List[TaskTemplate])
def list_templates(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Get all templates for the current user."""
    templates = session.exec(
        select(TaskTemplate)
        .where(TaskTemplate.user_id == current_user.id)
        .order_by(TaskTemplate.created_at.desc())
    ).all()

    return templates


@router.get("/{template_id}", response_model=TaskTemplate)
def get_template(
    template_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Get a specific template."""
    template = session.get(TaskTemplate, template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    if template.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this template"
        )

    return template


@router.put("/{template_id}", response_model=TaskTemplate)
def update_template(
    template_id: int,
    data: TemplateUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Update a template."""
    template = session.get(TaskTemplate, template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    if template.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this template"
        )

    if data.name is not None:
        template.name = data.name
    if data.description is not None:
        template.description = data.description
    if data.template_data is not None:
        template.template_data = data.template_data

    template.updated_at = datetime.now(timezone.utc)

    session.add(template)
    session.commit()
    session.refresh(template)

    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Delete a template."""
    template = session.get(TaskTemplate, template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    if template.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this template"
        )

    session.delete(template)
    session.commit()

    return None


@router.post("/{template_id}/create-task", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task_from_template(
    template_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth)
):
    """Create a new task from a template."""
    template = session.get(TaskTemplate, template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    if template.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this template"
        )

    # Create task from template data
    task_data = template.template_data.copy()
    task = Task(
        user_id=current_user.id,
        title=task_data.get("title", template.name),
        description=task_data.get("description"),
        priority=task_data.get("priority", "medium"),
        category_id=task_data.get("category_id"),
        completed=False
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
