# SQLModel Skill

Quick reference for SQLModel (Pydantic + SQLAlchemy) used in Phase II.

## Installation

```bash
pip install sqlmodel
```

## Basic Model

```python
from sqlmodel import Field, SQLModel
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)
```

## Relationships

```python
from sqlmodel import Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)

    # One-to-many relationship
    tasks: list["Task"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    title: str

    # Many-to-one relationship
    user: Optional[User] = Relationship(back_populates="tasks")
```

## Database Connection

```python
from sqlmodel import create_engine, Session

# PostgreSQL
DATABASE_URL = "postgresql://user:pass@host/db"
engine = create_engine(DATABASE_URL, echo=True)

# Create tables
SQLModel.metadata.create_all(engine)

# Session
with Session(engine) as session:
    # Use session here
    pass
```

## CRUD Operations

### Create
```python
from sqlmodel import Session

with Session(engine) as session:
    task = Task(title="Buy groceries", description="Milk, eggs")
    session.add(task)
    session.commit()
    session.refresh(task)  # Get ID back
    print(task.id)
```

### Read
```python
from sqlmodel import select

with Session(engine) as session:
    # Get by ID
    task = session.get(Task, 1)

    # Query all
    statement = select(Task)
    tasks = session.exec(statement).all()

    # Filter
    statement = select(Task).where(Task.completed == False)
    pending = session.exec(statement).all()

    # Filter with multiple conditions
    statement = select(Task).where(
        Task.user_id == 1,
        Task.completed == False
    )
    user_pending = session.exec(statement).all()
```

### Update
```python
with Session(engine) as session:
    task = session.get(Task, 1)
    task.title = "Updated title"
    session.add(task)
    session.commit()
    session.refresh(task)
```

### Delete
```python
with Session(engine) as session:
    task = session.get(Task, 1)
    session.delete(task)
    session.commit()
```

## Querying

### Filtering
```python
# WHERE
statement = select(Task).where(Task.completed == True)

# AND
statement = select(Task).where(Task.user_id == 1, Task.completed == False)

# OR
from sqlmodel import or_
statement = select(Task).where(or_(Task.completed == True, Task.user_id == 1))
```

### Sorting
```python
# Order by
statement = select(Task).order_by(Task.created_at.desc())

# Multiple columns
statement = select(Task).order_by(Task.completed, Task.created_at.desc())
```

### Pagination
```python
# Limit and offset
statement = select(Task).offset(20).limit(10)  # Skip 20, take 10
```

### Joins
```python
# Join with relationship
statement = select(Task).join(User).where(User.email == "test@example.com")
```

## Indexes

```python
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)  # Single column index
    completed: bool = Field(default=False, index=True)
```

## Constraints

```python
class User(SQLModel, table=True):
    email: str = Field(unique=True)  # Unique constraint
    age: int = Field(ge=0, le=150)   # Check constraint (0-150)
```

## Field Types

```python
from datetime import datetime

class Task(SQLModel, table=True):
    # Basic types
    title: str
    count: int
    price: float
    active: bool

    # Optional
    description: Optional[str] = None

    # With default
    completed: bool = Field(default=False)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Key Concepts

- **SQLModel = Pydantic + SQLAlchemy**: Type safety + ORM
- **table=True**: Marks class as database table
- **Field()**: Configure column properties
- **Relationship()**: Define table relationships
- **select()**: Build SQL queries
- **Session**: Database transaction context
