"""
In-memory storage for ChatKit threads and messages.

This simple implementation stores conversation threads in memory.
For production, replace with database persistence.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    ThreadItemsPage,
    CreateThreadMetadataParams,
)
from chatkit.server import ChatKitThreadItemStore


class MemoryStore(ChatKitThreadItemStore[Dict[str, Any]]):
    """Simple in-memory store for ChatKit threads and items."""

    def __init__(self) -> None:
        self._threads: Dict[str, ThreadMetadata] = {}
        self._items: Dict[str, List[ThreadItem]] = {}
        self._item_counter = 0

    def generate_item_id(
        self,
        item_type: str,
        thread: ThreadMetadata,
        context: Dict[str, Any]
    ) -> str:
        """Generate unique item ID."""
        self._item_counter += 1
        return f"{item_type}_{thread.id}_{self._item_counter}"

    async def create_thread(
        self,
        params: CreateThreadMetadataParams,
        context: Dict[str, Any]
    ) -> ThreadMetadata:
        """Create a new conversation thread."""
        thread = ThreadMetadata(
            id=f"thread_{len(self._threads) + 1}",
            title=params.title,
            metadata=params.metadata or {},
            created_at=datetime.now(),
        )
        self._threads[thread.id] = thread
        self._items[thread.id] = []
        return thread

    async def load_thread(
        self,
        thread_id: str,
        context: Dict[str, Any]
    ) -> Optional[ThreadMetadata]:
        """Load thread metadata by ID."""
        return self._threads.get(thread_id)

    async def update_thread(
        self,
        thread: ThreadMetadata,
        context: Dict[str, Any]
    ) -> ThreadMetadata:
        """Update thread metadata."""
        self._threads[thread.id] = thread
        return thread

    async def save_thread_items(
        self,
        items: List[ThreadItem],
        context: Dict[str, Any]
    ) -> None:
        """Save thread items to storage."""
        for item in items:
            thread_items = self._items.setdefault(item.thread_id, [])

            # Update existing item or append new one
            existing_idx = next(
                (i for i, existing in enumerate(thread_items) if existing.id == item.id),
                None
            )

            if existing_idx is not None:
                thread_items[existing_idx] = item
            else:
                thread_items.append(item)

    async def load_thread_items(
        self,
        thread_id: str,
        after: Optional[str],
        limit: int,
        order: str,
        context: Dict[str, Any],
    ) -> ThreadItemsPage:
        """Load thread items with pagination."""
        items = self._items.get(thread_id, [])

        # Apply ordering
        sorted_items = sorted(
            items,
            key=lambda x: x.created_at,
            reverse=(order == "desc")
        )

        # Apply pagination
        if after:
            try:
                after_idx = next(
                    i for i, item in enumerate(sorted_items) if item.id == after
                )
                sorted_items = sorted_items[after_idx + 1:]
            except StopIteration:
                sorted_items = []

        # Limit results
        limited_items = sorted_items[:limit]

        return ThreadItemsPage(
            data=limited_items,
            has_more=len(sorted_items) > limit,
        )
