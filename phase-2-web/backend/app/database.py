"""
Database connection and session management for Neon PostgreSQL.

This module provides:
- SQLModel engine creation with connection pooling
- Session dependency for FastAPI dependency injection
- Database initialization utilities
"""

from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import NullPool
from app.config import settings

# Database configuration
DATABASE_URL = settings.database_url

# Create engine with connection pooling for Neon PostgreSQL
# Neon serverless postgres requires specific pool settings
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries (disable in production)
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        "connect_timeout": 10,  # 10 second connection timeout
        "options": "-c timezone=utc"  # Use UTC timezone
    }
)


def get_session():
    """
    Database session dependency for FastAPI.

    Yields a SQLModel session that automatically commits on success
    and rolls back on exceptions.

    Usage:
        @app.get("/tasks")
        def get_tasks(session: Session = Depends(get_session)):
            return session.exec(select(Task)).all()
    """
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    """
    Create all database tables defined by SQLModel models.

    This should be called on application startup.
    Call this after importing all models to ensure they're registered.
    """
    SQLModel.metadata.create_all(engine)


def drop_db_and_tables():
    """
    Drop all database tables.

    WARNING: This will delete all data!
    Only use for testing or development reset.
    """
    SQLModel.metadata.drop_all(engine)
