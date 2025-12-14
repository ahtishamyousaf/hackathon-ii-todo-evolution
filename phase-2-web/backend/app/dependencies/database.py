"""
Database session dependencies for FastAPI dependency injection.

Provides session management for API endpoints.
"""

from sqlmodel import Session
from app.database import engine


def get_session():
    """
    Dependency that provides a database session.

    Automatically handles:
    - Session creation
    - Transaction commit on success
    - Rollback on exception
    - Session cleanup

    Usage:
        @app.get("/tasks")
        def get_tasks(session: Session = Depends(get_session)):
            tasks = session.exec(select(Task)).all()
            return tasks

    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
