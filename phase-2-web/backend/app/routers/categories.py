"""
Category management API endpoints.

This module provides RESTful API endpoints for category CRUD operations:
- POST /api/categories - Create new category
- GET /api/categories - List all user's categories
- GET /api/categories/{id} - Get single category
- PUT /api/categories/{id} - Update category
- DELETE /api/categories/{id} - Delete category (preserves tasks)

All endpoints enforce user isolation via JWT authentication.

Feature: 004-task-categories
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime
import re

from app.models.category import Category, CategoryCreate, CategoryUpdate, CategoryRead
from app.models.user import User
from app.database import get_session
from app.dependencies.better_auth import get_current_user_from_better_auth


# Create router
router = APIRouter(
    prefix="/api/categories",
    tags=["categories"],
    responses={
        401: {"description": "Unauthorized - Authentication required"},
        404: {"description": "Category not found or access denied"},
        409: {"description": "Category name already exists"},
        500: {"description": "Internal server error"},
    },
)


# Color validation pattern
COLOR_PATTERN = re.compile(r'^#[0-9A-Fa-f]{6}$')
DEFAULT_COLOR = "#9CA3AF"


def validate_color(color: str | None) -> str:
    """
    Validate and normalize color hex code.

    Args:
        color: Hex color code or None

    Returns:
        Validated color string (uppercase hex code or default)

    Raises:
        HTTPException: If color format is invalid
    """
    if color is None or color == "":
        return DEFAULT_COLOR

    if not COLOR_PATTERN.match(color):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Color must be a valid hex code (e.g., #FF5733)",
        )

    return color.upper()


def check_category_name_unique(
    session: Session, user_id: int, name: str, exclude_id: int | None = None
) -> None:
    """
    Check if category name is unique for the user.

    Args:
        session: Database session
        user_id: User ID to check uniqueness for
        name: Category name to check
        exclude_id: Category ID to exclude from check (for updates)

    Raises:
        HTTPException: If name already exists for this user
    """
    query = select(Category).where(
        Category.user_id == user_id, Category.name == name
    )

    # Exclude current category when updating
    if exclude_id is not None:
        query = query.where(Category.id != exclude_id)

    existing = session.exec(query).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category name already exists",
        )


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth),
):
    """
    Create a new category for the authenticated user.

    **User Story**: US1 (Create Custom Category)
    **Success Criteria**: SC-001 (create in <5 seconds)

    **Request Body**:
    - name: str (required, 1-50 characters, unique per user)
    - color: str (optional, hex format #RRGGBB, defaults to #9CA3AF)

    **Returns**: Created category with id and timestamps

    **Security**: User ID automatically extracted from JWT token

    **Validation**:
    - Name must be unique per user (case-sensitive)
    - Color must match hex pattern #RRGGBB
    """
    # Validate color
    validated_color = validate_color(category_data.color)

    # Check name uniqueness
    check_category_name_unique(session, current_user.id, category_data.name)

    # Create category with user_id from authenticated user
    db_category = Category(
        name=category_data.name,
        color=validated_color,
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    # Save to database
    session.add(db_category)
    session.commit()
    session.refresh(db_category)

    return db_category


@router.get("", response_model=List[CategoryRead])
async def list_categories(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth),
):
    """
    List all categories for the authenticated user.

    **User Story**: US1 (Create Custom Category)
    **Success Criteria**: SC-006 (100% user isolation), SC-007 (50+ categories)

    **Returns**: List of categories (ordered by name ASC)

    **Security**: Only returns categories where user_id matches authenticated user
    """
    # Query categories filtered by user_id, ordered by name alphabetically
    statement = (
        select(Category)
        .where(Category.user_id == current_user.id)
        .order_by(Category.name.asc())
    )

    categories = session.exec(statement).all()
    return categories


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth),
):
    """
    Get a single category by ID.

    **User Story**: US1 (Create Custom Category)

    **Parameters**:
    - category_id: int (category ID from path)

    **Returns**: Category object

    **Security**: Returns 404 if category not found OR belongs to different user
    (prevents information leakage)
    """
    # Query category by ID and user_id (enforces ownership)
    category = session.exec(
        select(Category).where(
            Category.id == category_id, Category.user_id == current_user.id
        )
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or you don't have permission to access it",
        )

    return category


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth),
):
    """
    Update an existing category's name and/or color.

    **User Story**: US4 (Update Category Details)
    **Success Criteria**: SC-004 (rename updates instantly <1 second)

    **Parameters**:
    - category_id: int (category ID from path)

    **Request Body** (all fields optional, at least one required):
    - name: str (1-50 characters, unique per user)
    - color: str (hex format #RRGGBB)

    **Returns**: Updated category

    **Security**: Only allows updating user's own categories

    **Validation**:
    - If name provided, must be unique per user (excluding this category)
    - If color provided, must match hex pattern
    """
    # Fetch category with ownership check
    category = session.exec(
        select(Category).where(
            Category.id == category_id, Category.user_id == current_user.id
        )
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or you don't have permission to access it",
        )

    # Update name if provided (with uniqueness check)
    if category_update.name is not None:
        check_category_name_unique(
            session, current_user.id, category_update.name, exclude_id=category_id
        )
        category.name = category_update.name

    # Update color if provided (with validation)
    if category_update.color is not None:
        category.color = validate_color(category_update.color)

    # Auto-update timestamp
    category.updated_at = datetime.utcnow()

    # Save changes
    session.add(category)
    session.commit()
    session.refresh(category)

    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user_from_better_auth),
):
    """
    Permanently delete a category.

    **User Story**: US5 (Delete Unused Categories)
    **Success Criteria**: SC-005 (0% data loss - tasks preserved)

    **Parameters**:
    - category_id: int (category ID from path)

    **Returns**: 204 No Content (empty response)

    **Behavior**: Tasks in this category become uncategorized (category_id set to null)
    This is handled automatically by the ON DELETE SET NULL foreign key constraint.

    **Note**: Confirmation is handled by frontend UI, backend performs immediate deletion

    **Security**: Only allows deleting user's own categories
    """
    # Fetch category with ownership check
    category = session.exec(
        select(Category).where(
            Category.id == category_id, Category.user_id == current_user.id
        )
    ).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or you don't have permission to access it",
        )

    # Delete category (tasks will be uncategorized automatically via ON DELETE SET NULL)
    session.delete(category)
    session.commit()

    # Return 204 No Content (no response body)
    return None
