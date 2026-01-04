"""
FastAPI application instance and configuration.

This is the main entry point for the Todo API.
Configures CORS, middleware, and registers routes.
"""

# Load .env file FIRST (before any other imports)
from dotenv import load_dotenv
load_dotenv()

import os
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
from app.routers.simple_chat import router as simple_chat_router

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
    Initializes MCP tools for Phase III AI agent.
    Called once when the application starts.

    Validates critical environment variables:
    - DATABASE_URL: Required for database connection
    - BETTER_AUTH_SECRET: Required for JWT authentication
    - OPENAI_API_KEY: Required for Phase III AI agent
    """
    # Validate critical environment variables
    required_env_vars = {
        "DATABASE_URL": os.getenv("DATABASE_URL"),
        "BETTER_AUTH_SECRET": os.getenv("BETTER_AUTH_SECRET"),
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
    }

    missing_vars = [var for var, value in required_env_vars.items() if not value]

    if missing_vars:
        error_msg = f"CRITICAL: Missing required environment variables: {', '.join(missing_vars)}"
        print(f"❌ {error_msg}")
        print("⚠️  Application will continue, but some features may not work properly:")
        if "OPENAI_API_KEY" in missing_vars:
            print("   - Phase III AI-Powered Chat will NOT function")
        if "DATABASE_URL" in missing_vars:
            print("   - Database operations will FAIL")
        if "BETTER_AUTH_SECRET" in missing_vars:
            print("   - JWT authentication will FAIL")
        print("\nPlease set these variables in your .env file or environment.")

    # Disable automatic table creation - using migrations instead
    # print("Creating database tables...")
    # create_db_and_tables()
    # print("Database tables created successfully!")

    # Phase III: Initialize MCP tools
    ai_provider = os.getenv("AI_PROVIDER", "openai").lower()
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if openai_key or gemini_key:
        from app.mcp.server import initialize_mcp_tools
        print("Initializing MCP tools for AI agent...")
        initialize_mcp_tools()
        print("✅ MCP tools initialized successfully!")
        print(f"✅ AI_PROVIDER: {ai_provider}")

        if ai_provider == "gemini" and gemini_key:
            print(f"✅ GEMINI_API_KEY loaded: {gemini_key[:20]}...")
        elif openai_key:
            print(f"✅ OPENAI_API_KEY loaded: {openai_key[:20]}...")
    else:
        print("⚠️  Skipping MCP tools initialization (No AI API key set)")


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
# Phase III: AI-Powered Todo Chatbot (Simple endpoint)
app.include_router(simple_chat_router)
