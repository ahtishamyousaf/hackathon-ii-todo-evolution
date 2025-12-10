# Feature Specification: Update Task

## Feature Overview

**Feature Name**: Update Task
**Feature ID**: F003
**Priority**: Critical (Core CRUD operation)
**Phase**: I - Console Application
**Status**: Specification Complete

## User Story

**As a** user
**I want to** modify the title and description of existing tasks
**So that** I can correct mistakes or update task details as my plans change

## Feature Description

The Update Task feature allows users to change the title and/or description of an existing task. Users specify which task to update by ID, see the current details, then provide new values. They can update one or both fields, and can skip fields they don't want to change.

### Success Outcome
User updates a task's title and/or description, receives confirmation, and the changes are reflected in the task list immediately.

## Acceptance Criteria

### Must Have (Required)
- ✅ AC1: User can update task by providing task ID
- ✅ AC2: System displays current task details before update
- ✅ AC3: User can update title only
- ✅ AC4: User can update description only
- ✅ AC5: User can update both title and description
- ✅ AC6: User can skip fields by pressing Enter (keeps current value)
- ✅ AC7: System validates task ID exists
- ✅ AC8: System validates new values (same rules as add task)
- ✅ AC9: System updates the updated_at timestamp
- ✅ AC10: System displays confirmation with new values
- ✅ AC11: Changes visible immediately in task list

### Should Have (Important)
- ✅ AC12: Show clear indication of which fields changed
- ✅ AC13: Helpful error messages for invalid inputs
- ✅ AC14: Allow canceling update (return to menu)

### Nice to Have (Enhancement)
- ⭕ AC15: Preview before confirming (future)
- ⭕ AC16: Undo capability (future)
- ⭕ AC17: Version history (future)

## User Interaction Flow

### Normal Flow - Update Both Fields
```
1. User selects "Update task" from main menu (option 3)
2. System displays "--- Update Task ---" header
3. System prompts: "Enter task ID to update: "
4. User enters task ID (e.g., "2")
5. System finds task by ID
6. System displays current task details:
   - ID
   - Current title
   - Current description
   - Status
7. System prompts: "New title (press Enter to keep current): "
8. User enters new title or presses Enter
9. System prompts: "New description (press Enter to keep current): "
10. User enters new description or presses Enter
11. System validates inputs
12. System updates task with new values
13. System updates updated_at timestamp
14. System displays success message with updated details
15. System prompts: "Press Enter to return to menu..."
16. User returns to main menu
```

### Alternative Flow A1: Update Title Only
```
1-7. Same as normal flow
8. User enters new title: "Updated title"
9. System prompts for description
10. User presses Enter (keeps current description)
11-16. System updates only title, shows confirmation
```

### Alternative Flow A2: Update Description Only
```
1-7. Same as normal flow
8. System prompts for new title
9. User presses Enter (keeps current title)
10. System prompts for description
11. User enters new description
12-16. System updates only description, shows confirmation
```

### Alternative Flow A3: Keep Both (No Changes)
```
1-7. Same as normal flow
8-9. User presses Enter for both prompts
10. System detects no changes
11. System displays: "No changes made"
12. Returns to menu
```

### Alternative Flow A4: Task Not Found
```
1-3. Same as normal flow
4. User enters task ID that doesn't exist (e.g., "99")
5. System searches for task
6. System displays error: "Task with ID 99 not found"
7. System prompts: "Press Enter to return to menu..."
8. User returns to main menu
```

## Data Requirements

### Input Data
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| task_id | int | Yes | Must be valid integer, task must exist |
| new_title | string | Optional | If provided: 1-200 chars, non-empty after trim |
| new_description | string | Optional | If provided: 0-1000 chars |

### Update Behavior
- If user presses Enter without input: Keep current value (no change)
- If user provides new value: Validate and update
- If both fields unchanged: Display "No changes made"
- If one or both changed: Update and show confirmation

### Output Data (Updated Task)
| Field | Update Rule |
|-------|-------------|
| id | Never changes |
| title | Updated if new value provided and valid |
| description | Updated if new value provided and valid |
| completed | Never changes (use separate feature) |
| created_at | Never changes (original creation time) |
| updated_at | Always set to current timestamp when ANY field changes |

## Validation Rules

### Task ID Validation
1. **Must be integer**: Can be parsed as int
2. **Must exist**: Task with this ID must be in task list
3. **Positive**: ID must be > 0

### Title Validation (If Provided)
1. **Non-Empty**: If user enters text, must contain at least one non-whitespace char
2. **Length**: Maximum 200 characters after trimming
3. **Trimming**: Remove leading/trailing whitespace before validation
4. **Optional**: Empty input (just Enter) means keep current value

### Description Validation (If Provided)
1. **Length**: Maximum 1000 characters after trimming
2. **Trimming**: Remove leading/trailing whitespace before storing
3. **Optional**: Empty input (just Enter) means keep current value
4. **Can be empty**: If user provides empty string (not just Enter), set to empty

## Error Handling

### Error Cases

#### E1: Task Not Found
**Condition**: User enters ID that doesn't exist
**Error Message**: "Error: Task with ID {id} not found."
**Action**: Return to main menu
**Return**: Main menu

#### E2: Invalid Task ID (Not a Number)
**Condition**: User enters non-numeric value
**Error Message**: "Error: Invalid ID. Please enter a number."
**Action**: Re-prompt for task ID
**Return**: Stay in update flow

#### E3: Empty Title (User Types Spaces Only)
**Condition**: User provides new title that's only whitespace
**Error Message**: "Error: Task title cannot be empty. Press Enter to keep current value."
**Action**: Re-prompt for title
**Return**: Stay in update flow

#### E4: Title Too Long
**Condition**: New title exceeds 200 characters
**Error Message**: "Error: Title too long (max 200 characters). Current length: {X}"
**Action**: Re-prompt for title
**Return**: Stay in update flow

#### E5: Description Too Long
**Condition**: New description exceeds 1000 characters
**Error Message**: "Error: Description too long (max 1000 characters). Current length: {X}"
**Action**: Re-prompt for description
**Return**: Stay in update flow

#### E6: No Changes Made
**Condition**: User presses Enter for both fields (no updates)
**Info Message**: "No changes made to task."
**Action**: Return to main menu
**Return**: Main menu (this is not an error, just info)

### Error Display Format
```
❌ Error: [Error message here]
```

## Success Messages

### Success Display Format
```
✓ Task updated successfully!
  ID: {id}
  Title: {new_title}
  Description: {new_description or "No description"}
  Status: {Pending/Complete}
  Updated: {timestamp}

Press Enter to return to menu...
```

## Implementation Guidance

### CLI Layer (cli.py)

```python
def handle_update_task(manager: TaskManager) -> None:
    """Handle the update task user interaction."""
    print("\n--- Update Task ---")

    # Get and validate task ID
    while True:
        id_input = input("Enter task ID to update: ").strip()
        try:
            task_id = int(id_input)
            break
        except ValueError:
            display_error("Invalid ID. Please enter a number.")

    # Get existing task
    task = manager.get_task_by_id(task_id)
    if not task:
        display_error(f"Task with ID {task_id} not found.")
        input("\nPress Enter to return to menu...")
        return

    # Display current task details
    print(f"\nCurrent task details:")
    print(f"  ID: {task.id}")
    print(f"  Title: {task.title}")
    print(f"  Description: {task.description or 'No description'}")
    print(f"  Status: {'Complete' if task.completed else 'Pending'}")
    print()

    # Get new title (optional)
    new_title = None
    while True:
        title_input = input("New title (press Enter to keep current): ").strip()
        if not title_input:
            # Keep current title
            break
        if len(title_input) > 200:
            display_error(f"Title too long (max 200 characters). Current length: {len(title_input)}")
            continue
        new_title = title_input
        break

    # Get new description (optional)
    new_description = None
    while True:
        desc_input = input("New description (press Enter to keep current): ").strip()
        if not desc_input:
            # Keep current description (user pressed Enter without typing)
            break
        if len(desc_input) > 1000:
            display_error(f"Description too long (max 1000 characters). Current length: {len(desc_input)}")
            continue
        new_description = desc_input
        break

    # Check if any changes
    if new_title is None and new_description is None:
        print("No changes made to task.")
        input("\nPress Enter to return to menu...")
        return

    # Update task
    updated_task = manager.update_task(task_id, new_title, new_description)

    if updated_task:
        display_success(f"Task updated successfully!\n"
                       f"  ID: {updated_task.id}\n"
                       f"  Title: {updated_task.title}\n"
                       f"  Description: {updated_task.description or 'No description'}\n"
                       f"  Status: {'Complete' if updated_task.completed else 'Pending'}\n"
                       f"  Updated: {updated_task.updated_at.strftime('%Y-%m-%d %H:%M')}")
    else:
        display_error("Failed to update task. Please try again.")

    input("\nPress Enter to return to menu...")
```

### Business Logic Layer (task_manager.py)

```python
def update_task(self, task_id: int, title: str = None,
               description: str = None) -> Optional[Task]:
    """Update task title and/or description.

    Args:
        task_id: ID of task to update
        title: New title (None = keep current)
        description: New description (None = keep current)

    Returns:
        Updated Task object, or None if task not found
    """
    # Find task
    task = self.get_task_by_id(task_id)
    if not task:
        return None

    # Validate new values if provided
    if title is not None and (not title or len(title) > 200):
        raise ValueError("Invalid title")
    if description is not None and len(description) > 1000:
        raise ValueError("Invalid description")

    # Update fields
    if title is not None:
        task.title = title
    if description is not None:
        task.description = description

    # Always update timestamp if any field changed
    if title is not None or description is not None:
        task.updated_at = datetime.now()

    return task
```

## Test Scenarios

### Test Case 1: Update Title Only
**Given**: Task exists with ID 1, title "Old Title", description "Old Description"
**When**: User updates task 1 with new title "New Title", presses Enter for description
**Then**:
- Title changed to "New Title"
- Description unchanged ("Old Description")
- updated_at timestamp updated
- created_at timestamp unchanged

### Test Case 2: Update Description Only
**Given**: Task exists with ID 1, title "Title", description "Old Desc"
**When**: User presses Enter for title, enters "New Desc" for description
**Then**:
- Title unchanged ("Title")
- Description changed to "New Desc"
- updated_at timestamp updated

### Test Case 3: Update Both Fields
**Given**: Task exists with ID 1
**When**: User provides new title and new description
**Then**:
- Both fields updated
- updated_at timestamp updated
- created_at unchanged

### Test Case 4: No Changes (Both Enter)
**Given**: Task exists with ID 1
**When**: User presses Enter for both title and description
**Then**:
- Message: "No changes made to task"
- Task unchanged
- updated_at NOT updated
- Return to menu

### Test Case 5: Task Not Found
**Given**: No task with ID 99
**When**: User enters ID 99
**Then**:
- Error: "Task with ID 99 not found"
- No update attempt
- Return to menu

### Test Case 6: Invalid ID (Non-Numeric)
**Given**: Update task flow
**When**: User enters "abc" as task ID
**Then**:
- Error: "Invalid ID. Please enter a number"
- Re-prompt for task ID
- Can retry with valid ID

### Test Case 7: New Title Too Long
**Given**: Task exists with ID 1
**When**: User enters 250-character title
**Then**:
- Error with current length and max
- Re-prompt for title
- Can provide shorter title

### Test Case 8: Verify Timestamp Update
**Given**: Task created at 2025-12-10 10:00
**When**: User updates task at 2025-12-10 15:00
**Then**:
- created_at still 2025-12-10 10:00
- updated_at now 2025-12-10 15:00
- Timestamps are different

### Test Case 9: Update Completed Task
**Given**: Task exists with completed=True
**When**: User updates title/description
**Then**:
- Fields updated successfully
- completed status unchanged (still True)
- Can update completed tasks

### Test Case 10: Whitespace Trimming
**Given**: Task exists
**When**: User enters "  New Title  " with spaces
**Then**:
- Title stored as "New Title" (trimmed)
- No leading/trailing spaces

## Example Interactions

### Example 1: Update Both Fields
```
Main Menu:
  ...
  3. Update task
  ...
Enter your choice (1-6): 3

--- Update Task ---
Enter task ID to update: 2

Current task details:
  ID: 2
  Title: Buy groceries
  Description: Milk and eggs
  Status: Pending

New title (press Enter to keep current): Buy groceries and fruit
New description (press Enter to keep current): Milk, eggs, bread, apples, and bananas

✓ Task updated successfully!
  ID: 2
  Title: Buy groceries and fruit
  Description: Milk, eggs, bread, apples, and bananas
  Status: Pending
  Updated: 2025-12-10 16:45

Press Enter to return to menu...
```

### Example 2: Update Title Only
```
Enter your choice (1-6): 3

--- Update Task ---
Enter task ID to update: 1

Current task details:
  ID: 1
  Title: Call dentist
  Description: Schedule appointment
  Status: Pending

New title (press Enter to keep current): Call dentist for checkup

New description (press Enter to keep current):

✓ Task updated successfully!
  ID: 1
  Title: Call dentist for checkup
  Description: Schedule appointment
  Status: Pending
  Updated: 2025-12-10 16:50

Press Enter to return to menu...
```

### Example 3: No Changes
```
Enter your choice (1-6): 3

--- Update Task ---
Enter task ID to update: 3

Current task details:
  ID: 3
  Title: Finish homework
  Description: Math and Science
  Status: Pending

New title (press Enter to keep current):
New description (press Enter to keep current):

No changes made to task.

Press Enter to return to menu...
```

### Example 4: Task Not Found
```
Enter your choice (1-6): 3

--- Update Task ---
Enter task ID to update: 99

❌ Error: Task with ID 99 not found.

Press Enter to return to menu...
```

### Example 5: Invalid ID
```
Enter your choice (1-6): 3

--- Update Task ---
Enter task ID to update: abc
❌ Error: Invalid ID. Please enter a number.
Enter task ID to update: 1

Current task details:
  ID: 1
  Title: Buy milk
  ...
```

## Non-Functional Requirements

### Performance
- Task lookup should be instant (<10ms)
- Update operation should be instant (<10ms)
- No lag in user interaction

### Usability
- Current values clearly displayed before prompting
- Clear indication that fields are optional (can press Enter)
- Confirmation shows exactly what changed
- Easy to cancel (press Enter for both = no changes)

### Reliability
- Cannot corrupt task data
- Validation prevents invalid states
- Timestamps always consistent
- Original data preserved if update fails

## Dependencies

### Depends On
- Task dataclass (models.py)
- TaskManager.get_task_by_id() method
- TaskManager.update_task() method
- datetime module

### Required By
- Users need this to fix typos or update plans
- Complements add/delete for full CRUD

## Edge Cases

### Edge Case 1: Update Empty Description to Have Content
**Scenario**: Task has no description, user adds one
**Expected**: Description field populated, updated_at changed
**Solution**: Treat empty-to-content same as any update

### Edge Case 2: Clear Description (Make Empty)
**Scenario**: Task has description, user wants to clear it
**Expected**: Currently not supported (Enter keeps current)
**Solution Phase I**: Cannot clear description once set
**Future**: Add "clear" keyword or separate option

### Edge Case 3: Update Right After Creation
**Scenario**: Create task, immediately update it
**Expected**: updated_at differs from created_at (even if seconds later)
**Solution**: Always set updated_at to current time

### Edge Case 4: Special Characters in Title
**Scenario**: User enters title with quotes, newlines, etc.
**Expected**: Accept all printable characters, preserve them
**Solution**: No character restrictions (except length)

## Future Enhancements (Out of Scope for Phase I)

- ⭕ Update completion status (separate feature already exists)
- ⭕ Update multiple tasks at once (batch update)
- ⭕ Preview changes before confirming
- ⭕ Undo recent update
- ⭕ View update history/changelog
- ⭕ Update by title search (not just ID)
- ⭕ Clear fields (set to empty explicitly)

## Acceptance Validation

### How to Verify This Feature Works

1. **Add a task**: Create task with ID 1
2. **Update title**: Change title, press Enter for desc, verify title changed
3. **Update description**: Press Enter for title, change desc, verify desc changed
4. **Update both**: Change both fields, verify both updated
5. **No changes**: Press Enter for both, verify "No changes" message
6. **Invalid ID**: Enter 999, verify error message
7. **Task not found**: Enter ID that doesn't exist, verify error
8. **Check timestamps**: Verify updated_at changes, created_at doesn't
9. **View updated task**: Use "View tasks" to confirm changes visible
10. **Long title**: Try 250-char title, verify error and re-prompt

### Success Criteria Met When:
- ✅ All 14 "Must Have" acceptance criteria pass
- ✅ All 10 test scenarios pass
- ✅ All 5 example interactions work as shown
- ✅ No data corruption possible
- ✅ Timestamps updated correctly

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Feature Status**: Ready for Implementation
**Next Step**: Generate code with Claude Code using this specification
