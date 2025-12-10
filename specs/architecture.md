# Todo Console App - Phase I Architecture

## Architecture Overview

### Design Philosophy
The Phase I architecture follows these principles:
1. **Clean Separation of Concerns**: UI, business logic, and data models are independent
2. **Testability First**: Each component can be tested in isolation
3. **Future-Proof**: Design allows easy integration with database (Phase II) and web API (Phase II)
4. **Simplicity**: No over-engineering, just what's needed for Phase I

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User (Console)                        │
└────────────────────────┬────────────────────────────────┘
                         │ text input/output
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   CLI Layer (cli.py)                     │
│  • Display menu                                          │
│  • Get user input                                        │
│  • Format output                                         │
│  • Handle user interaction flow                          │
└────────────────────────┬────────────────────────────────┘
                         │ function calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic (task_manager.py)            │
│  • TaskManager class                                     │
│  • CRUD operations                                       │
│  • Business rules validation                             │
│  • ID generation                                         │
└────────────────────────┬────────────────────────────────┘
                         │ operates on
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Model (models.py)                   │
│  • Task dataclass                                        │
│  • Type definitions                                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              In-Memory Storage (Python list)             │
│  • List[Task] stored in TaskManager                      │
│  • Persists only during runtime                          │
└─────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Main Entry Point (main.py)

**Responsibility**: Application startup and main loop

**Structure**:
```python
def main() -> None:
    """Application entry point."""
    # Initialize TaskManager
    # Display welcome message
    # Enter main loop
    # Handle exit
```

**Key Behaviors**:
- Creates TaskManager instance
- Calls CLI menu display in a loop
- Catches keyboard interrupts (Ctrl+C) for graceful exit
- Displays goodbye message on exit

**Error Handling**:
- Catch unexpected exceptions and display friendly error
- Ensure clean exit even on errors
- Never crash without user-friendly message

---

### 2. Data Model (models.py)

**Responsibility**: Define the Task entity and related types

**Task Dataclass**:
```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Task:
    """Represents a todo task."""
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    def __str__(self) -> str:
        """Human-readable string representation."""
        status = "✓" if self.completed else "○"
        return f"[{self.id}] {status} {self.title}"
```

**Design Decisions**:
- Use `dataclass` for automatic `__init__`, `__repr__`, `__eq__`
- All fields required (no Optional) for clarity
- Include `__str__` for easy display
- Timestamps use `datetime` for future timezone support

**Validation Rules**:
- `id`: Positive integer, unique, auto-generated
- `title`: Non-empty string, 1-200 characters
- `description`: String, 0-1000 characters, can be empty
- `completed`: Boolean, defaults to False
- `created_at`: Auto-set, immutable after creation
- `updated_at`: Auto-set, updated on every modification

**Future Extensibility**:
- Easy to add fields (priority, tags, due_date) in Phase V
- Dataclass can be converted to SQLModel in Phase II
- Structure supports JSON serialization for API (Phase II)

---

### 3. Business Logic (task_manager.py)

**Responsibility**: Manage tasks and implement business rules

**TaskManager Class**:
```python
from typing import List, Optional
from models import Task
from datetime import datetime

class TaskManager:
    """Manages the todo task list."""

    def __init__(self):
        """Initialize with empty task list."""
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """Create and add a new task."""
        # Validation
        # Create Task
        # Add to list
        # Increment ID counter
        # Return created task

    def get_all_tasks(self) -> List[Task]:
        """Get all tasks."""
        # Return copy of task list

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """Get a task by ID or None if not found."""
        # Search list
        # Return task or None

    def update_task(self, task_id: int, title: str = None,
                   description: str = None) -> Optional[Task]:
        """Update task title and/or description."""
        # Find task
        # Validate inputs
        # Update fields
        # Update updated_at timestamp
        # Return updated task or None

    def delete_task(self, task_id: int) -> bool:
        """Delete a task by ID."""
        # Find task
        # Remove from list
        # Return True if deleted, False if not found

    def toggle_complete(self, task_id: int) -> Optional[Task]:
        """Toggle task completion status."""
        # Find task
        # Toggle completed field
        # Update updated_at timestamp
        # Return updated task or None

    def get_statistics(self) -> dict:
        """Get task statistics."""
        # Count total, completed, pending
        # Return as dict
```

**Design Decisions**:
- Encapsulate task list as private (`_tasks`)
- All methods return values (functional style where possible)
- Use `Optional[Task]` for operations that might fail
- Separate concerns: TaskManager doesn't do I/O or formatting
- ID counter managed internally

**Business Rules**:
- IDs start at 1 and increment sequentially
- IDs are never reused (even after deletion)
- Title must be non-empty (validated in add_task)
- Update operations partially update (only provided fields)
- Operations are atomic (complete or fail, no partial states)

**Error Handling Strategy**:
- Invalid operations return `None` or `False` (not exceptions)
- Caller (CLI layer) handles error messaging
- Validation happens before state changes
- No silent failures (always return status)

**Storage Implementation**:
- Python `List[Task]` in memory
- Linear search for ID lookups (acceptable for Phase I scale)
- No persistence to disk
- Easy to swap with database in Phase II

---

### 4. CLI Interface (cli.py)

**Responsibility**: User interaction, input/output, formatting

**Core Functions**:
```python
from typing import Optional
from task_manager import TaskManager

def show_menu() -> None:
    """Display main menu."""
    # Print menu options

def get_menu_choice() -> int:
    """Get and validate menu choice from user."""
    # Prompt for input
    # Validate numeric input
    # Return choice or 0 on error

def handle_add_task(manager: TaskManager) -> None:
    """Handle add task user interaction."""
    # Prompt for title
    # Prompt for description
    # Validate inputs
    # Call manager.add_task()
    # Display success or error message

def handle_view_tasks(manager: TaskManager) -> None:
    """Handle view tasks user interaction."""
    # Get all tasks from manager
    # Format as table
    # Display to user
    # Show statistics

def handle_update_task(manager: TaskManager) -> None:
    """Handle update task user interaction."""
    # Prompt for task ID
    # Show current task details
    # Prompt for new title (optional)
    # Prompt for new description (optional)
    # Call manager.update_task()
    # Display success or error message

def handle_delete_task(manager: TaskManager) -> None:
    """Handle delete task user interaction."""
    # Prompt for task ID
    # Show task to be deleted
    # Ask for confirmation
    # Call manager.delete_task()
    # Display success or error message

def handle_toggle_complete(manager: TaskManager) -> None:
    """Handle mark complete user interaction."""
    # Prompt for task ID
    # Call manager.toggle_complete()
    # Display new status

def format_task_list(tasks: List[Task]) -> str:
    """Format task list as a table."""
    # Create header
    # Format each task as row
    # Return formatted string

def display_error(message: str) -> None:
    """Display error message with formatting."""
    # Add error prefix/styling
    # Print to console

def display_success(message: str) -> None:
    """Display success message with formatting."""
    # Add success prefix/styling
    # Print to console
```

**Design Decisions**:
- Pure I/O functions, no business logic
- All functions take TaskManager as parameter (dependency injection)
- Formatting functions are pure (input → output, no side effects)
- User prompts are clear and include examples
- Consistent error and success message styling

**Input Validation**:
- Menu choices: Must be 1-6
- Task IDs: Must be valid integers
- Titles: Must be non-empty, max 200 chars
- Descriptions: Max 1000 chars, empty allowed
- Confirmations: y/n for destructive operations

**Output Formatting**:
```
Example table format:
ID  | Status    | Title                | Created
----|-----------|---------------------|-------------------
1   | ○ Pending | Buy groceries       | 2025-12-10 14:30
2   | ✓ Done    | Call dentist        | 2025-12-10 13:15
```

**Error Messages**:
- Clear and specific: "Task with ID 5 not found"
- Actionable: "Please enter a number between 1 and 6"
- Friendly tone: "No tasks yet. Add your first task!"

---

## Data Flow

### Add Task Flow
```
User Input           CLI Layer              Business Logic        Data Model
    │                    │                         │                   │
    ├──"1"──────────────►│                         │                   │
    │                    │                         │                   │
    ├─"Buy milk"────────►│                         │                   │
    │                    │                         │                   │
    ├─"From store"──────►│                         │                   │
    │                    │                         │                   │
    │                    ├──add_task()────────────►│                   │
    │                    │   ("Buy milk",          │                   │
    │                    │    "From store")        │                   │
    │                    │                         │                   │
    │                    │                         ├─Create Task──────►│
    │                    │                         │  (id=1,           │
    │                    │                         │   title="Buy...", │
    │                    │                         │   completed=False)│
    │                    │                         │                   │
    │                    │                         │◄──Task object─────┤
    │                    │                         │                   │
    │                    │                         ├─Append to list    │
    │                    │                         │                   │
    │                    │◄──Task object───────────┤                   │
    │                    │                         │                   │
    │◄─"✓ Task created"──┤                         │                   │
    │    "ID: 1..."      │                         │                   │
```

### View Tasks Flow
```
User Input           CLI Layer              Business Logic        Data Model
    │                    │                         │                   │
    ├──"2"──────────────►│                         │                   │
    │                    │                         │                   │
    │                    ├──get_all_tasks()───────►│                   │
    │                    │                         │                   │
    │                    │◄──List[Task]────────────┤                   │
    │                    │                         │                   │
    │                    ├─format_task_list()      │                   │
    │                    │                         │                   │
    │◄─"ID | Status..."──┤                         │                   │
    │    "1  | ○ ..."     │                         │                   │
```

### Update/Delete/Complete Flow
```
User Input           CLI Layer              Business Logic        Data Model
    │                    │                         │                   │
    ├──"3"/"4"/"5"──────►│                         │                   │
    │                    │                         │                   │
    ├──Task ID──────────►│                         │                   │
    │                    │                         │                   │
    │                    ├──operation(id)─────────►│                   │
    │                    │                         │                   │
    │                    │                         ├─Find task by ID   │
    │                    │                         │                   │
    │                    │                         ├─Modify task       │
    │                    │                         │                   │
    │                    │◄──Task or None──────────┤                   │
    │                    │                         │                   │
    │◄─Success/Error─────┤                         │                   │
```

---

## Module Responsibilities

### models.py
- ✅ Define Task dataclass
- ✅ Type definitions
- ✅ Task string representation
- ❌ No business logic
- ❌ No I/O operations
- ❌ No storage management

### task_manager.py
- ✅ Manage task collection
- ✅ Implement CRUD operations
- ✅ Generate unique IDs
- ✅ Enforce business rules
- ✅ Manage in-memory storage
- ❌ No user interaction
- ❌ No formatting/display
- ❌ No input prompting

### cli.py
- ✅ Display menus and prompts
- ✅ Get user input
- ✅ Format output
- ✅ Display error/success messages
- ✅ Handle user interaction flow
- ❌ No business logic
- ❌ No direct data manipulation
- ❌ No task creation/modification

### main.py
- ✅ Application initialization
- ✅ Main program loop
- ✅ Exception handling at top level
- ✅ Graceful shutdown
- ❌ Minimal logic (just orchestration)

---

## Error Handling Strategy

### Error Categories

#### 1. User Input Errors (Recoverable)
**Examples**:
- Invalid menu choice (not 1-6)
- Non-numeric input where number expected
- Empty title when required
- Task ID doesn't exist

**Handling**:
- Display clear error message
- Re-prompt for correct input
- Never crash
- Show example of valid input

#### 2. Validation Errors (Preventable)
**Examples**:
- Title too long (>200 chars)
- Description too long (>1000 chars)

**Handling**:
- Validate before processing
- Return error to user
- Suggest correction

#### 3. System Errors (Unexpected)
**Examples**:
- Out of memory
- Unexpected exception

**Handling**:
- Catch at top level (main.py)
- Display friendly error message
- Log error details (future: proper logging)
- Exit gracefully

### Error Handling by Layer

**CLI Layer** (cli.py):
- Catch input format errors (ValueError)
- Validate input ranges
- Display error messages
- Re-prompt user

**Business Logic Layer** (task_manager.py):
- Return None/False for failed operations
- Don't raise exceptions for business rule violations
- Let caller handle error messaging
- Validate before state changes

**Main Entry Point** (main.py):
- Catch unexpected exceptions
- Keyboard interrupt (Ctrl+C) handling
- Display friendly error and exit

---

## Design Patterns

### 1. Dependency Injection
- CLI functions receive TaskManager as parameter
- Makes testing easier (can inject mock)
- Loose coupling between layers

### 2. Single Responsibility
- Each module has one clear purpose
- Each function does one thing well
- Easy to understand and modify

### 3. Return Values Over Exceptions
- Operations return None/False on failure
- Simpler flow control
- Easier to reason about

### 4. Immutable Where Possible
- Return new lists instead of mutating
- Clear data ownership
- Reduces bugs

---

## Future Extensibility

### Phase II: Database Integration
**What Changes**:
- TaskManager internal storage (`_tasks` list → database queries)
- Add database connection in `__init__`
- CRUD methods call database instead of list operations

**What Stays Same**:
- Task dataclass (becomes SQLModel)
- TaskManager interface (same method signatures)
- CLI layer (no changes needed!)
- Main entry point (no changes needed!)

### Phase II: Web API
**What Changes**:
- Add FastAPI layer above TaskManager
- TaskManager becomes service layer
- CLI might be removed or kept as alternative interface

**What Stays Same**:
- Task dataclass
- TaskManager business logic
- Validation rules

### Phase III: AI Chatbot
**What Changes**:
- Add natural language parsing layer
- Map NL commands to TaskManager methods
- Add MCP server for integration

**What Stays Same**:
- Task dataclass
- TaskManager business logic
- Core CRUD operations

---

## Performance Considerations

### Phase I Scale
- Target: 1-1000 tasks
- Linear search acceptable (O(n))
- In-memory storage sufficient
- No performance issues expected

### Bottlenecks (Not a Concern Yet)
- ID lookup: Linear search is fine for <1000 tasks
- Display all: Acceptable for console output
- Memory usage: Negligible for thousands of tasks

### Future Optimizations (Phase II+)
- Database indexing for fast ID lookup
- Pagination for large task lists
- Caching for frequently accessed tasks

---

## Testing Strategy (Design for Testability)

### Unit Tests (Future)
**models.py**:
- Test Task dataclass creation
- Test validation rules

**task_manager.py**:
- Test each CRUD operation
- Test edge cases (empty list, not found, etc.)
- Test ID generation

**cli.py**:
- Test formatting functions
- Test input validation
- Mock TaskManager for isolation

### Integration Tests (Future)
- Test full user flows
- Test error handling end-to-end

### Manual Testing (Phase I)
- Test each feature through console
- Test error cases
- Test edge cases (empty list, single item, many items)

---

## File Organization

```
hackathon-2/
├── constitution.md           # Project principles
├── specs/
│   ├── overview.md          # This file's sibling
│   ├── architecture.md      # This file
│   └── features/            # Feature specifications
│       ├── 01-add-task.md
│       ├── 02-view-tasks.md
│       ├── 03-update-task.md
│       ├── 04-delete-task.md
│       └── 05-mark-complete.md
├── src/
│   ├── __init__.py          # Package marker
│   ├── main.py              # Entry point (imports cli, creates TaskManager)
│   ├── models.py            # Task dataclass
│   ├── task_manager.py      # TaskManager class
│   └── cli.py               # All CLI functions
├── CLAUDE.md                 # Instructions for code generation
├── README.md                 # User documentation
├── pyproject.toml           # UV configuration
└── .gitignore               # Git ignore rules
```

---

## Architecture Validation Checklist

### Separation of Concerns
- ✅ Data model separate from logic
- ✅ Logic separate from presentation
- ✅ Each layer has clear boundaries

### Testability
- ✅ Business logic isolated
- ✅ Functions are pure where possible
- ✅ Dependencies injectable

### Maintainability
- ✅ Clear module responsibilities
- ✅ Consistent error handling
- ✅ Good naming conventions

### Extensibility
- ✅ Easy to add database (Phase II)
- ✅ Easy to add web API (Phase II)
- ✅ Easy to add new features (Phase V)

### Simplicity
- ✅ No over-engineering
- ✅ Uses standard library only
- ✅ Clear data flow

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Phase**: I - Console Application
**Status**: Architecture Complete
**Next**: Feature Specifications (01-add-task.md through 05-mark-complete.md)
