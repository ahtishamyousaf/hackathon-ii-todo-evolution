"""
FastAPI application instance and configuration.

This is the main entry point for the Todo API.
Configures CORS, middleware, and registers routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_db_and_tables
from app.routers import auth_router

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="RESTful API for Todo Management with user authentication",
    version=settings.app_version,
    docs_url="/docs" if settings.is_development else None,  # Disable docs in production
    redoc_url="/redoc" if settings.is_development else None,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Frontend origins
    allow_credentials=True,  # Allow cookies and authorization headers
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.get("/", tags=["Health"])
def root():
    """
    Root endpoint - API health check.

    Returns:
        dict: API status and version
    """
    return {
        "message": f"{settings.app_name} is running",
        "version": settings.app_version,
        "environment": settings.environment,
        "docs": "/docs" if settings.is_development else "disabled",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint for monitoring.

    Returns:
        dict: Service health status
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@app.on_event("startup")
def on_startup():
    """
    Application startup event.

    Creates database tables if they don't exist.
    Called once when the application starts.
    """
    print("Creating database tables...")
    create_db_and_tables()
    print("Database tables created successfully!")


@app.on_event("shutdown")
def on_shutdown():
    """
    Application shutdown event.

    Cleanup tasks before application stops.
    """
    print("Shutting down application...")


# Include routers
app.include_router(auth_router)
