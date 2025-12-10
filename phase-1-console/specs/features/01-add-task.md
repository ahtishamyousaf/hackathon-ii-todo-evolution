# Feature Specification: Add Task

## Feature Overview

**Feature Name**: Add Task
**Feature ID**: F001
**Priority**: Critical (Core CRUD operation)
**Phase**: I - Console Application
**Status**: Specification Complete

## User Story

**As a** user
**I want to** create new todo tasks with a title and optional description
**So that** I can track things I need to do

## Feature Description

The Add Task feature allows users to create new todo items in their task list. Each task requires a title (what needs to be done) and can optionally include a description (additional details). The system automatically assigns a unique ID and timestamps to each task.

### Success Outcome
User creates a new task and receives confirmation with the task ID, making the task immediately available for viewing, updating, completing, or deleting.

## Acceptance Criteria

### Must Have (Required)
- ✅ AC1: User can add a task by providing a title
- ✅ AC2: User can optionally provide a description
- ✅ AC3: System generates unique sequential task ID
- ✅ AC4: System sets created_at timestamp automatically
- ✅ AC5: System sets updated_at timestamp automatically
- ✅ AC6: Task defaults to incomplete/pending status
- ✅ AC7: System validates title is not empty
- ✅ AC8: System displays confirmation with task details
- ✅ AC9: Task is immediately available in task list

### Should Have (Important)
- ✅ AC10: Title limited to 200 characters
- ✅ AC11: Description limited to 1000 characters
- ✅ AC12: User can skip description (press Enter)
- ✅ AC13: Clear error messages for validation failures

### Nice to Have (Enhancement)
- ⭕ AC14: Show character count while typing (future)
- ⭕ AC15: Suggest similar tasks if duplicates exist (future)

## User Interaction Flow

### Normal Flow
```
1. User selects "Add new task" from main menu (option 1)
2. System displays "--- Add New Task ---" header
3. System prompts: "Task title: "
4. User enters title (e.g., "Buy groceries")
5. System prompts: "Task description (optional): "
6. User enters description (e.g., "Milk, eggs, bread") OR presses Enter to skip
7. System validates inputs
8. System creates task with auto-generated ID and timestamps
9. System displays success message with task details:
   - Task ID
   - Title
   - Description (or "No description" if empty)
   - Status (Pending)
10. System prompts: "Press Enter to return to menu..."
11. User returns to main menu
```

### Alternative Flows

#### A1: User Skips Description
```
1-4. Same as normal flow
5. System prompts: "Task description (optional): "
6. User presses Enter without typing
7. System creates task with empty description
8-11. Same as normal flow (shows "No description")
```

#### A2: User Enters Very Long Text
```
1-4. Same as normal flow
5. User enters title longer than 200 characters
6. System displays error: "Title too long (max 200 characters)"
7. System re-prompts for title
8. User enters valid title
9-11. Continue with normal flow
```

## Data Requirements

### Input Data
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | 1-200 chars, non-empty, no leading/trailing whitespace |
| description | string | No | 0-1000 chars, can be empty |

### Output Data (Created Task)
| Field | Type | Set By | Value |
|-------|------|--------|-------|
| id | int | System | Auto-incremented (starts at 1) |
| title | string | User | Trimmed user input |
| description | string | User | Trimmed user input or empty string |
| completed | bool | System | False |
| created_at | datetime | System | Current timestamp |
| updated_at | datetime | System | Current timestamp (same as created_at) |

## Validation Rules

### Title Validation
1. **Non-Empty**: Must contain at least one non-whitespace character
2. **Length**: Maximum 200 characters after trimming
3. **Trimming**: Remove leading/trailing whitespace before validation
4. **Characters**: All printable characters allowed (including unicode)

### Description Validation
1. **Optional**: Can be completely empty
2. **Length**: Maximum 1000 characters after trimming
3. **Trimming**: Remove leading/trailing whitespace before storing
4. **Characters**: All printable characters allowed (including unicode)

### Business Rules
1. **Unique IDs**: Each task gets a unique ID, never reused
2. **Sequential IDs**: IDs increment by 1 (1, 2, 3, ...)
3. **Timestamps**: Use system local time
4. **Default Status**: All new tasks are incomplete

## Error Handling

### Error Cases

#### E1: Empty Title
**Condition**: User enters only whitespace or empty string
**Error Message**: "Error: Task title cannot be empty. Please enter a title."
**Action**: Re-prompt for title
**Return**: Stay in add task flow

#### E2: Title Too Long
**Condition**: Title exceeds 200 characters after trimming
**Error Message**: "Error: Title too long (max 200 characters). Current length: {X}"
**Action**: Re-prompt for title
**Return**: Stay in add task flow

#### E3: Description Too Long
**Condition**: Description exceeds 1000 characters after trimming
**Error Message**: "Error: Description too long (max 1000 characters). Current length: {X}"
**Action**: Re-prompt for description
**Return**: Stay in add task flow

#### E4: System Error
**Condition**: Unexpected error during task creation
**Error Message**: "Error: Failed to create task. Please try again."
**Action**: Return to main menu
**Return**: Main menu

### Error Display Format
```
❌ Error: [Error message here]
```

## Success Messages

### Success Display Format
```
✓ Task created successfully!
  ID: {id}
  Title: {title}
  Description: {description or "No description"}
  Status: Pending

Press Enter to return to menu...
```

## Implementation Guidance

### CLI Layer (cli.py)

```python
def handle_add_task(manager: TaskManager) -> None:
    """Handle the add task user interaction."""
    print("\n--- Add New Task ---")

    # Get and validate title
    while True:
        title = input("Task title: ").strip()
        if not title:
            display_error("Task title cannot be empty. Please enter a title.")
            continue
        if len(title) > 200:
            display_error(f"Title too long (max 200 characters). Current length: {len(title)}")
            continue
        break

    # Get and validate description
    while True:
        description = input("Task description (optional): ").strip()
        if len(description) > 1000:
            display_error(f"Description too long (max 1000 characters). Current length: {len(description)}")
            continue
        break

    # Create task
    task = manager.add_task(title, description)

    if task:
        display_success(f"Task created successfully!\n"
                       f"  ID: {task.id}\n"
                       f"  Title: {task.title}\n"
                       f"  Description: {task.description or 'No description'}\n"
                       f"  Status: Pending")
    else:
        display_error("Failed to create task. Please try again.")

    input("\nPress Enter to return to menu...")
```

### Business Logic Layer (task_manager.py)

```python
def add_task(self, title: str, description: str = "") -> Task:
    """Create and add a new task.

    Args:
        title: Task title (required, non-empty)
        description: Task description (optional)

    Returns:
        The created Task object
    """
    # Validation (should already be done by CLI, but double-check)
    if not title or len(title) > 200:
        raise ValueError("Invalid title")
    if len(description) > 1000:
        raise ValueError("Invalid description")

    # Create task
    now = datetime.now()
    task = Task(
        id=self._next_id,
        title=title,
        description=description,
        completed=False,
        created_at=now,
        updated_at=now
    )

    # Add to list and increment ID counter
    self._tasks.append(task)
    self._next_id += 1

    return task
```

## Test Scenarios

### Test Case 1: Basic Add Task
**Given**: Empty task list
**When**: User adds task with title "Buy groceries" and description "Milk and eggs"
**Then**:
- Task created with ID 1
- Title is "Buy groceries"
- Description is "Milk and eggs"
- Status is Pending
- Timestamps are set
- Task appears in task list

### Test Case 2: Add Task Without Description
**Given**: Empty task list
**When**: User adds task with title "Call dentist" and no description
**Then**:
- Task created with ID 1
- Title is "Call dentist"
- Description is empty string
- Status is Pending

### Test Case 3: Multiple Tasks Sequential IDs
**Given**: Empty task list
**When**: User adds three tasks
**Then**:
- First task has ID 1
- Second task has ID 2
- Third task has ID 3
- IDs never repeat

### Test Case 4: Empty Title Rejected
**Given**: Add task flow
**When**: User enters empty title or only spaces
**Then**:
- Error message displayed
- User re-prompted for title
- Task not created

### Test Case 5: Title Too Long
**Given**: Add task flow
**When**: User enters title with 250 characters
**Then**:
- Error message shows current length (250) and limit (200)
- User re-prompted for title
- Task not created

### Test Case 6: Description Too Long
**Given**: Add task flow
**When**: User enters description with 1500 characters
**Then**:
- Error message shows current length and limit
- User re-prompted for description
- Task not created

### Test Case 7: Whitespace Trimming
**Given**: Add task flow
**When**: User enters "  Buy milk  " as title
**Then**:
- Title stored as "Buy milk" (trimmed)
- No leading/trailing spaces

### Test Case 8: Unicode Characters
**Given**: Add task flow
**When**: User enters title with emoji "Buy 🥛 milk"
**Then**:
- Title stored correctly with emoji
- Task created successfully

## Example Interactions

### Example 1: Complete Success Flow
```
Main Menu:
  1. Add new task
  ...
Enter your choice (1-6): 1

--- Add New Task ---
Task title: Buy groceries
Task description (optional): Milk, eggs, bread, and coffee

✓ Task created successfully!
  ID: 1
  Title: Buy groceries
  Description: Milk, eggs, bread, and coffee
  Status: Pending

Press Enter to return to menu...
```

### Example 2: Skip Description
```
--- Add New Task ---
Task title: Call dentist
Task description (optional):

✓ Task created successfully!
  ID: 2
  Title: Call dentist
  Description: No description
  Status: Pending

Press Enter to return to menu...
```

### Example 3: Error - Empty Title
```
--- Add New Task ---
Task title:
❌ Error: Task title cannot be empty. Please enter a title.
Task title:
❌ Error: Task title cannot be empty. Please enter a title.
Task title: Finish homework

Task description (optional): Math and Science assignments

✓ Task created successfully!
  ID: 3
  Title: Finish homework
  Description: Math and Science assignments
  Status: Pending

Press Enter to return to menu...
```

### Example 4: Error - Title Too Long
```
--- Add New Task ---
Task title: This is an extremely long task title that exceeds the maximum allowed length of 200 characters and should be rejected by the validation system because we need to keep our titles concise and readable in the console interface and very long titles would break the formatting
❌ Error: Title too long (max 200 characters). Current length: 287
Task title: This is a much shorter title

Task description (optional): Details here

✓ Task created successfully!
  ID: 4
  Title: This is a much shorter title
  Description: Details here
  Status: Pending

Press Enter to return to menu...
```

## Non-Functional Requirements

### Performance
- Task creation should be instantaneous (<10ms)
- No lag when entering text

### Usability
- Clear prompts indicate what's expected
- Optional fields clearly marked as "(optional)"
- Error messages are helpful and actionable
- Success messages confirm what was created

### Reliability
- Input validation prevents invalid data
- No crashes on any input
- Graceful handling of edge cases

## Dependencies

### Depends On
- Task dataclass (models.py)
- TaskManager.add_task() method (task_manager.py)
- datetime module (Python standard library)

### Required By
- Main menu (must route to this feature)
- All other features (need tasks to exist)

## Future Enhancements (Out of Scope for Phase I)

- ⭕ Task categories/projects
- ⭕ Due dates
- ⭕ Priority levels
- ⭕ Tags
- ⭕ Duplicate detection
- ⭕ Rich text descriptions
- ⭕ Attachments
- ⭕ Subtasks

## Acceptance Validation

### How to Verify This Feature Works

1. **Start application**: Run `uv run python src/main.py`
2. **Select option 1**: Add new task
3. **Enter title**: "Test Task"
4. **Enter description**: "This is a test"
5. **Verify**: Success message shows correct details
6. **Check task list**: Select option 2, verify task appears with ID 1
7. **Add second task**: Verify ID is 2
8. **Test empty title**: Verify error and re-prompt
9. **Test long title**: Enter 250-char title, verify error
10. **Test empty description**: Press Enter, verify task created

### Success Criteria Met When:
- ✅ All 9 "Must Have" acceptance criteria pass
- ✅ All 8 test scenarios pass
- ✅ All 4 example interactions work as shown
- ✅ No crashes on any input
- ✅ Error messages are clear and helpful

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Feature Status**: Ready for Implementation
**Next Step**: Generate code with Claude Code using this specification
