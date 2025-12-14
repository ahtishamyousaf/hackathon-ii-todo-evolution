---
name: pydantic
description: Pydantic data validation for Python/FastAPI. Use when creating request/response schemas, validating API data, ensuring type safety, or defining configuration models.
---

# Pydantic Data Validation

Data validation using Python type annotations.

## Installation

```bash
pip install pydantic
```

## Basic Models

```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class User(BaseModel):
    id: int
    email: EmailStr
    name: str
    age: int | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Create instance
user = User(id=1, email="user@example.com", name="John")

# Access fields
print(user.email)  # user@example.com
print(user.dict())  # Convert to dict
print(user.json())  # Convert to JSON string
```

## Field Validation

```python
from pydantic import BaseModel, Field, validator

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)

    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
```

## Common Field Types

```python
from pydantic import BaseModel, EmailStr, HttpUrl, constr, conint
from typing import Optional, List
from datetime import datetime

class UserSchema(BaseModel):
    # Constrained types
    username: constr(min_length=3, max_length=20)
    age: conint(ge=0, le=150)  # Greater than or equal, less than or equal

    # Email validation
    email: EmailStr

    # URL validation
    website: HttpUrl | None = None

    # Optional fields
    middle_name: Optional[str] = None

    # Lists
    tags: List[str] = []

    # Datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## FastAPI Request Schemas

```python
from pydantic import BaseModel, EmailStr, Field

# User Registration
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123"
            }
        }

# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Task Create
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)

# Task Update
class TaskUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    description: str | None = Field(None, max_length=1000)
```

## Response Schemas

```python
from pydantic import BaseModel
from datetime import datetime

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode (SQLModel compatibility)

class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Usage with SQLModel
task_db = session.get(Task, task_id)
task_response = TaskResponse.from_orm(task_db)  # Converts SQLModel to Pydantic
```

## Validators

```python
from pydantic import BaseModel, validator, root_validator
import re

class PasswordSchema(BaseModel):
    password: str
    confirm_password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain number')
        return v

    @root_validator
    def passwords_match(cls, values):
        password = values.get('password')
        confirm = values.get('confirm_password')
        if password != confirm:
            raise ValueError('Passwords do not match')
        return values
```

## Email Validation

```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr

    @validator('email')
    def email_must_be_valid(cls, v):
        # Additional custom validation
        if not v.endswith('@company.com'):
            raise ValueError('Must use company email')
        return v.lower()
```

## Environment Configuration

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    better_auth_secret: str
    allowed_origins: str = "http://localhost:3000"
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False

# Usage
settings = Settings()
print(settings.database_url)
```

## Nested Models

```python
from pydantic import BaseModel
from typing import List

class Address(BaseModel):
    street: str
    city: str
    country: str

class User(BaseModel):
    name: str
    email: str
    address: Address
    tags: List[str]

# Usage
user = User(
    name="John",
    email="john@example.com",
    address={
        "street": "123 Main St",
        "city": "NYC",
        "country": "USA"
    },
    tags=["admin", "user"]
)
```

## Enums

```python
from enum import Enum
from pydantic import BaseModel

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(BaseModel):
    title: str
    status: TaskStatus = TaskStatus.PENDING

# Usage
task = Task(title="Do something", status=TaskStatus.PENDING)
task = Task(title="Do something", status="pending")  # Also works
```

## Custom Validators

```python
from pydantic import BaseModel, validator

class Task(BaseModel):
    title: str
    priority: int

    @validator('priority')
    def priority_must_be_valid(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Priority must be between 1 and 5')
        return v

    @validator('title')
    def title_must_not_contain_special_chars(cls, v):
        if not v.replace(' ', '').isalnum():
            raise ValueError('Title can only contain letters and numbers')
        return v
```

## Field Defaults

```python
from pydantic import BaseModel, Field
from datetime import datetime

class Task(BaseModel):
    title: str
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # With description
    priority: int = Field(
        default=3,
        ge=1,
        le=5,
        description="Task priority from 1 (lowest) to 5 (highest)"
    )
```

## Exclude Fields from Response

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    email: str
    password_hash: str

    class Config:
        from_attributes = True

# Exclude sensitive fields
user_dict = user.dict(exclude={'password_hash'})

# Or create separate response model
class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True
```

## With FastAPI

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister):
    # user_data is automatically validated
    # Returns UserResponse (password excluded)
    user = create_user(user_data)
    return user
```

## Error Handling

```python
from pydantic import ValidationError

try:
    user = User(email="invalid", age="not a number")
except ValidationError as e:
    print(e.json())
    # [
    #   {
    #     "loc": ["email"],
    #     "msg": "value is not a valid email address",
    #     "type": "value_error.email"
    #   },
    #   {
    #     "loc": ["age"],
    #     "msg": "value is not a valid integer",
    #     "type": "type_error.integer"
    #   }
    # ]
```

## Complete Example: Task Schemas

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# Create Task Request
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: str = Field(default="", max_length=1000, description="Task description")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        }

# Update Task Request
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Buy groceries and fruits",
                "description": "Milk, eggs, bread, apples, bananas"
            }
        }

# Task Response
class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2025-01-15T10:30:00",
                "updated_at": "2025-01-15T10:30:00"
            }
        }

# List Response with Pagination
class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int
```

## Best Practices

1. **Use Field() for constraints**: Better than manual validation
2. **Separate request/response**: Don't reuse same model for both
3. **Enable ORM mode**: Set `from_attributes = True` for SQLModel compatibility
4. **Add examples**: Use `json_schema_extra` for API docs
5. **Type hints**: Use Python 3.10+ union syntax (`str | None`)
6. **Validators**: Use `@validator` for complex validation
7. **Exclude sensitive data**: Don't expose password hashes in responses
8. **Custom error messages**: Make validation errors user-friendly

## Key Concepts

- **Automatic Validation**: Type checking and constraints
- **ORM Mode**: Convert SQLModel/SQLAlchemy to Pydantic
- **FastAPI Integration**: Request/response validation
- **Type Safety**: Runtime type checking
- **Error Messages**: Clear validation errors
