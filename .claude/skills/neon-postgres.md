---
name: neon-postgres
description: Neon serverless PostgreSQL database setup and configuration. Use when setting up database connections, configuring connection pooling, handling migrations, or troubleshooting Neon database issues.
---

# Neon PostgreSQL

Quick reference for Neon serverless PostgreSQL used in Phase II.

## What is Neon?

Neon is a serverless PostgreSQL database with:
- Automatic scaling
- Generous free tier
- Instant database branching
- Built-in connection pooling

## Setup

1. **Create account**: https://neon.tech
2. **Create project**: Get connection string
3. **Connection string format**:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## Connection with SQLModel

```python
from sqlmodel import create_engine

DATABASE_URL = "postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries
    pool_pre_ping=True,  # Verify connections before using
)
```

## Environment Variables

```bash
# .env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

```python
import os
from sqlmodel import create_engine

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
```

## Connection Pooling

```python
from sqlmodel import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=5,        # Number of connections to maintain
    max_overflow=10,     # Additional connections when pool is full
    pool_pre_ping=True,  # Test connections before use
    pool_recycle=3600,   # Recycle connections after 1 hour
)
```

## FastAPI Integration

```python
# app/database.py
from sqlmodel import create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
```

```python
# app/main.py
from fastapi import FastAPI, Depends
from sqlmodel import SQLModel, Session
from app.database import engine, get_session

app = FastAPI()

@app.on_event("startup")
def on_startup():
    # Create tables
    SQLModel.metadata.create_all(engine)

@app.get("/tasks")
def get_tasks(session: Session = Depends(get_session)):
    return session.exec(select(Task)).all()
```

## Migrations

### Using Alembic (Optional)

```bash
# Install
pip install alembic

# Initialize
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Add tasks table"

# Apply migration
alembic upgrade head
```

### Simple Approach (Development)

```python
# Create tables on startup
from sqlmodel import SQLModel

@app.on_event("startup")
def create_tables():
    SQLModel.metadata.create_all(engine)
```

## Neon Features

### Database Branching
- Create branches for development/testing
- Each branch is isolated
- Great for testing migrations

### Autoscaling
- Scales to zero when inactive
- Scales up automatically under load
- No manual configuration needed

### Connection Limits
- Free tier: 100 concurrent connections
- Use connection pooling to stay within limits

## Best Practices

1. **Use SSL**: Always include `?sslmode=require`
2. **Connection pooling**: Prevent connection exhaustion
3. **Environment variables**: Never hardcode credentials
4. **pool_pre_ping**: Verify connections are alive
5. **Close sessions**: Use context managers (`with Session()`)
6. **Indexes**: Add indexes on frequently queried columns
7. **Monitor**: Check Neon dashboard for performance

## Common Issues

### Connection Timeout
```python
# Increase timeout
engine = create_engine(
    DATABASE_URL,
    connect_args={"connect_timeout": 10}
)
```

### Too Many Connections
```python
# Reduce pool size
engine = create_engine(
    DATABASE_URL,
    pool_size=3,
    max_overflow=5
)
```

### SSL Error
```
Make sure connection string includes: ?sslmode=require
```

## Example Configuration

```python
# config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

```python
# database.py
from sqlmodel import create_engine
from config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.environment == "development",
    pool_pre_ping=True,
)
```

## Key Concepts

- **Serverless**: No server management needed
- **Autoscaling**: Scales automatically
- **Branching**: Git-like database branches
- **Connection pooling**: Reuse connections
- **SSL required**: Always use secure connections
