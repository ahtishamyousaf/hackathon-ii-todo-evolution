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
from app.routers.tasks import router as tasks_router
from app.routers.categories import router as categories_router
from app.routers.subtasks import router as subtasks_router
from app.routers.comments import router as comments_router
from app.routers.attachments import router as attachments_router
from app.routers.task_dependencies import router as task_dependencies_router
from app.routers.dashboard import router as dashboard_router
from app.routers.time_entries import router as time_entries_router
from app.routers.task_templates import router as task_templates_router
from app.routers.notifications import router as notifications_router
from app.routers.search import router as search_router

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

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    auth_header = request.headers.get("authorization")
    print(f"[{request.method}] {request.url.path} - Auth header: {auth_header[:30] if auth_header else 'None'}...")
    response = await call_next(request)
    print(f"  -> Response: {response.status_code}")
    return response


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
# Phase II MVP: Authentication + Task Management
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(search_router)  # Phase 1 Quick Wins: Enhanced Search
# Phase II Enhancement: Category Management
app.include_router(categories_router)
# Phase II Extended Features: Subtasks, Comments, Attachments, Dependencies, Dashboard
app.include_router(subtasks_router)
app.include_router(comments_router)
app.include_router(attachments_router)
app.include_router(task_dependencies_router)
app.include_router(dashboard_router)
# Phase III: Time Tracking, Templates, Notifications
app.include_router(time_entries_router)
app.include_router(task_templates_router)
app.include_router(notifications_router)
