# FastAPI Skill

Quick reference for FastAPI patterns and best practices used in Phase II.

## Quick Start

```python
from fastapi import FastAPI

app = FastAPI(title="My API", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Hello World"}
```

## Common Patterns

### Path Parameters
```python
@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    return {"task_id": task_id}
```

### Query Parameters
```python
@app.get("/tasks")
def list_tasks(skip: int = 0, limit: int = 20, completed: bool | None = None):
    return {"skip": skip, "limit": limit}
```

### Request Body (Pydantic)
```python
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str = ""

@app.post("/tasks")
def create_task(task: TaskCreate):
    return task
```

### Response Model
```python
class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool

@app.get("/tasks/{id}", response_model=TaskResponse)
def get_task(id: int):
    return TaskResponse(id=id, title="Test", completed=False)
```

### Status Codes
```python
from fastapi import status

@app.post("/tasks", status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate):
    return task
```

### Dependency Injection
```python
from fastapi import Depends

def get_db():
    db = Database()
    try:
        yield db
    finally:
        db.close()

@app.get("/tasks")
def list_tasks(db = Depends(get_db)):
    return db.get_tasks()
```

### Error Handling
```python
from fastapi import HTTPException

@app.get("/tasks/{id}")
def get_task(id: int):
    task = find_task(id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

### CORS
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Router (Code Organization)
```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("")
def list_tasks():
    return []

app.include_router(router)
```

## Key Concepts

- **Automatic Documentation**: `/docs` (Swagger UI), `/redoc`
- **Type Validation**: Pydantic validates request/response data
- **Async Support**: Use `async def` for async operations
- **Dependency Injection**: Clean way to share resources
- **Exception Handling**: `HTTPException` for API errors
