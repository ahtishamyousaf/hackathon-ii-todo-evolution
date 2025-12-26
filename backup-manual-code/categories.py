"""
Category CRUD API endpoints.

All endpoints require JWT authentication and validate user ownership.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel

from app.database import get_session
from app.models.category import Category
from app.dependencies.auth import get_current_user
from app.models.user import User


# Request/Response schemas
class CategoryCreate(BaseModel):
    name: str
    color: str = "#3B82F6"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new category for the authenticated user.
    """
    category = Category(
        user_id=current_user.id,
        name=category_data.name,
        color=category_data.color
    )

    session.add(category)
    session.commit()
    session.refresh(category)

    return category


@router.get("/", response_model=List[Category])
def list_categories(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all categories for the authenticated user.
    """
    statement = select(Category).where(Category.user_id == current_user.id).order_by(Category.name)
    categories = session.exec(statement).all()

    return categories


@router.get("/{category_id}", response_model=Category)
def get_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific category.
    """
    category = session.get(Category, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Validate ownership
    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this category"
        )

    return category


@router.put("/{category_id}", response_model=Category)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update a category.
    """
    category = session.get(Category, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Validate ownership
    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this category"
        )

    # Update fields if provided
    if category_data.name is not None:
        category.name = category_data.name
    if category_data.color is not None:
        category.color = category_data.color

    category.updated_at = datetime.now(timezone.utc)

    session.add(category)
    session.commit()
    session.refresh(category)

    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a category.

    Note: This will set category_id to NULL for all tasks using this category.
    """
    category = session.get(Category, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Validate ownership
    if category.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this category"
        )

    # Delete category (tasks will have category_id set to NULL due to ON DELETE SET NULL)
    session.delete(category)
    session.commit()
