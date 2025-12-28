"""
Category model and schemas for task categorization system.

This module defines the Category entity with SQLModel for database ORM
and Pydantic validation. Includes schemas for create, update, and read operations.

Feature: 004-task-categories
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import re


class CategoryBase(SQLModel):
    """
    Base model for Category containing shared fields.

    Used as foundation for CategoryCreate and Category models.
    """
    name: str = Field(
        max_length=50,
        min_length=1,
        description="Category name (required, 1-50 characters, unique per user)"
    )
    color: Optional[str] = Field(
        default="#9CA3AF",
        max_length=7,
        description="Hex color code (e.g., #FF5733, defaults to gray #9CA3AF)"
    )

    @classmethod
    def validate_color(cls, color: Optional[str]) -> str:
        """
        Validate and normalize color hex code.

        Args:
            color: Hex color code or None

        Returns:
            Validated color string (uppercase hex code or default)

        Raises:
            ValueError: If color format is invalid
        """
        if color is None:
            return "#9CA3AF"

        # Validate hex pattern
        if not re.match(r'^#[0-9A-Fa-f]{6}$', color):
            raise ValueError("Color must be a valid hex code (e.g., #FF5733)")

        return color.upper()


class Category(CategoryBase, table=True):
    """
    Database model for Category entity.

    Represents a user-defined organizational group for tasks.
    Each category belongs to a user and has a name and color.

    Table name: categories
    Indexes: user_id, (user_id, name) for uniqueness
    Constraints: UNIQUE(user_id, name)
    """
    __tablename__ = "categories"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Unique category identifier (auto-generated)"
    )
    user_id: str = Field(
        foreign_key="users.id",
        index=True,
        description="Owner user ID (from JWT token)"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Category creation timestamp (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp (UTC, auto-updated)"
    )


class CategoryCreate(CategoryBase):
    """
    Schema for creating new categories.

    Excludes auto-generated fields (id, user_id, timestamps).
    User ID is extracted from JWT token, not provided in request body.

    Validation:
    - name: required, 1-50 characters, unique per user
    - color: optional, hex format (#RRGGBB), defaults to #9CA3AF
    """
    pass


class CategoryUpdate(SQLModel):
    """
    Schema for updating existing categories.

    All fields are optional to allow partial updates.
    At least one field must be provided.

    Validation:
    - name: if provided, must be 1-50 characters, unique per user
    - color: if provided, must be valid hex code
    """
    name: Optional[str] = Field(
        default=None,
        max_length=50,
        min_length=1,
        description="Updated category name (must remain unique per user)"
    )
    color: Optional[str] = Field(
        default=None,
        max_length=7,
        description="Updated hex color code"
    )


class CategoryRead(CategoryBase):
    """
    Schema for reading categories (API response).

    Includes all fields including auto-generated ones.
    Used for API responses to ensure clients get complete category data.
    """
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
