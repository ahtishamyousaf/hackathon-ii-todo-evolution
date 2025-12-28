"""
Database models for the application.

Phase II (MVP): User and Task models
Phase II Enhancement: Category models for task organization
Phase II Extended: Time tracking, templates, notifications
Phase III: Chat conversations and messages for AI-powered todo chatbot
"""

from app.models.user import User
from app.models.task import Task, TaskCreate, TaskUpdate, TaskRead
from app.models.category import Category, CategoryCreate, CategoryUpdate, CategoryRead
from app.models.time_entry import TimeEntry
from app.models.task_template import TaskTemplate
from app.models.notification import Notification
from app.models.conversation import Conversation
from app.models.message import Message

__all__ = [
    "User",
    "Task",
    "TaskCreate",
    "TaskUpdate",
    "TaskRead",
    "Category",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryRead",
    "TimeEntry",
    "TaskTemplate",
    "Notification",
    "Conversation",
    "Message",
]
