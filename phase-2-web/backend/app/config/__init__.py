"""
Application configuration management.

Loads and validates environment variables using Pydantic Settings.
Provides type-safe access to configuration values.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings are loaded from .env file or environment.
    Required settings will raise an error if not provided.
    """

    # Database
    database_url: str

    # Security
    secret_key: str
    better_auth_secret: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # Application
    environment: str = "development"
    debug: bool = True
    app_name: str = "Todo API"
    app_version: str = "1.0.0"

    # Database pool settings (Neon specific)
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_recycle: int = 3600  # 1 hour

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"  # Allow extra fields from environment

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() == "development"


# Create singleton settings instance
settings = Settings()
