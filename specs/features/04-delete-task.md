# Feature Specification: Delete Task

## Feature Overview

**Feature Name**: Delete Task
**Feature ID**: F004
**Priority**: Critical (Core CRUD operation)
**Phase**: I - Console Application
**Status**: Specification Complete

## User Story

**As a** user
**I want to** remove tasks from my list
**So that** I can clean up completed or canceled tasks and keep my list focused

## Feature Description

The Delete Task feature allows users to permanently remove tasks from their todo list. Users specify which task to delete by ID, see the task details, confirm the deletion, and receive confirmation that the task has been removed. This is a destructive operation that cannot be undone.

### Success Outcome
User deletes a task, receives confirmation, and the task no longer appears in the task list.

## Acceptance Criteria

### Must Have (Required)
- ✅ AC1: User can delete task by providing task ID
- ✅ AC2: System displays task details before deletion
- ✅ AC3: System asks for confirmation before deleting
- ✅ AC4: User can confirm deletion (y/yes)
- ✅ AC5: User can cancel deletion (n/no/anything else)
- ✅ AC6: System validates task ID exists
- ✅ AC7: Task is permanently removed from list
- ✅ AC8: System displays deletion confirmation
- ✅ AC9: Deleted task no longer appears in task list
- ✅ AC10: Task IDs are not reused after deletion

### Should Have (Important)
- ✅ AC11: Clear warning that deletion is permanent
- ✅ AC12: Confirmation is case-insensitive (Y/y/Yes/yes)
- ✅ AC13: Easy to cancel (default to no if unclear)
- ✅ AC14: Show task details clearly so user knows what they're deleting

### Nice to Have (Enhancement)
- ⭕ AC15: Undo delete within session (future)
- ⭕ AC16: Archive instead of delete (future)
- ⭕ AC17: Bulk delete (multiple tasks) (future)

## User Interaction Flow

### Normal Flow - Confirm Deletion
```
1. User selects "Delete task" from main menu (option 4)
2. System displays "--- Delete Task ---" header
3. System prompts: "Enter task ID to delete: "
4. User enters task ID (e.g., "3")
5. System finds task by ID
6. System displays task details:
   - ID
   - Title
   - Description
   - Status
7. System displays warning: "⚠️  This action cannot be undone!"
8. System prompts: "Are you sure you want to delete this task? (y/n): "
9. User enters "y" or "yes"
10. System removes task from list
11. System displays success message with deleted task details
12. System prompts: "Press Enter to return to menu..."
13. User returns to main menu
```

### Alternative Flow A1: Cancel Deletion
```
1-8. Same as normal flow
9. User enters "n", "no", or any other input
10. System displays: "Deletion canceled"
11. Task remains in list (unchanged)
12. System prompts: "Press Enter to return to menu..."
13. User returns to main menu
```

### Alternative Flow A2: Task Not Found
```
1-4. Same as normal flow
5. System searches for task (not found)
6. System displays error: "Task with ID {id} not found"
7. System prompts: "Press Enter to return to menu..."
8. User returns to main menu
```

### Alternative Flow A3: Invalid Task ID
```
1-3. Same as normal flow
4. User enters non-numeric value (e.g., "abc")
5. System displays error: "Invalid ID. Please enter a number"
6. System re-prompts: "Enter task ID to delete: "
7. User can retry with valid ID or return to menu
```

## Data Requirements

### Input Data
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| task_id | int | Yes | Must be valid integer, task must exist |
| confirmation | string | Yes | y/yes/n/no (case-insensitive) |

### Confirmation Values
| User Input | Interpretation | Action |
|------------|----------------|---------|
| y | Yes | Delete task |
| Y | Yes | Delete task |
| yes | Yes | Delete task |
| Yes | Yes | Delete task |
| YES | Yes | Delete task |
| n | No | Cancel |
| N | No | Cancel |
| no | No | Cancel |
| No | No | Cancel |
| NO | No | Cancel |
| (empty) | No | Cancel |
| (anything else) | No | Cancel |

### Output Result
- **Success**: Task removed from list, ID not reused
- **Cancel**: Task unchanged, still in list
- **Not Found**: No change to list

## Validation Rules

### Task ID Validation
1. **Must be integer**: Can be parsed as int
2. **Must exist**: Task with this ID must be in task list
3. **Positive**: ID must be > 0

### Confirmation Validation
1. **Accept yes**: y, Y, yes, Yes, YES all mean yes
2. **Accept no**: n, N, no, No, NO all mean no
3. **Default to no**: Empty input or any other value means no (safe default)
4. **Case insensitive**: Normalize to lowercase before checking

### Business Rules
1. **Permanent deletion**: No undo within Phase I
2. **IDs not reused**: Even after deletion, IDs never repeat
3. **No cascade**: Deleting task doesn't affect other tasks
4. **Immediate effect**: Deletion takes effect immediately after confirmation

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
**Return**: Stay in delete flow

#### E3: System Error During Deletion
**Condition**: Unexpected error when removing task
**Error Message**: "Error: Failed to delete task. Please try again."
**Action**: Task not deleted, return to menu
**Return**: Main menu

### Error Display Format
```
❌ Error: [Error message here]
```

## Success Messages

### Success Display Format
```
✓ Task deleted successfully!
  Deleted task:
  - ID: {id}
  - Title: {title}
  - Description: {description or "No description"}

Press Enter to return to menu...
```

### Cancellation Message Format
```
Deletion canceled. Task not deleted.

Press Enter to return to menu...
```

## Implementation Guidance

### CLI Layer (cli.py)

```python
def handle_delete_task(manager: TaskManager) -> None:
    """Handle the delete task user interaction."""
    print("\n--- Delete Task ---")

    # Get and validate task ID
    while True:
        id_input = input("Enter task ID to delete: ").strip()
        if not id_input:
            return  # Allow exit
        try:
            task_id = int(id_input)
            break
        except ValueError:
            display_error("Invalid ID. Please enter a number.")

    # Get task details
    task = manager.get_task_by_id(task_id)
    if not task:
        display_error(f"Task with ID {task_id} not found.")
        input("\nPress Enter to return to menu...")
        return

    # Display task to be deleted
    print(f"\nTask to delete:")
    print(f"  ID: {task.id}")
    print(f"  Title: {task.title}")
    print(f"  Description: {task.description or 'No description'}")
    print(f"  Status: {'Complete' if task.completed else 'Pending'}")
    print()
    print("⚠️  This action cannot be undone!")

    # Ask for confirmation
    confirmation = input("Are you sure you want to delete this task? (y/n): ").strip().lower()

    if confirmation in ['y', 'yes']:
        # Delete task
        success = manager.delete_task(task_id)
        if success:
            display_success(f"Task deleted successfully!\n"
                           f"  Deleted task:\n"
                           f"  - ID: {task.id}\n"
                           f"  - Title: {task.title}\n"
                           f"  - Description: {task.description or 'No description'}")
        else:
            display_error("Failed to delete task. Please try again.")
    else:
        print("Deletion canceled. Task not deleted.")

    input("\nPress Enter to return to menu...")
```

### Business Logic Layer (task_manager.py)

```python
def delete_task(self, task_id: int) -> bool:
    """Delete a task by ID.

    Args:
        task_id: ID of task to delete

    Returns:
        True if task was deleted, False if task not found
    """
    # Find task
    task = self.get_task_by_id(task_id)
    if not task:
        return False

    # Remove from list
    self._tasks.remove(task)
    return True
```

## Test Scenarios

### Test Case 1: Delete Existing Task
**Given**: Task list has task with ID 2
**When**: User deletes task 2 and confirms with "y"
**Then**:
- Task 2 removed from list
- Success message displayed
- Task 2 no longer appears in "View tasks"
- Other tasks unchanged

### Test Case 2: Cancel Deletion with "n"
**Given**: Task list has task with ID 3
**When**: User starts delete for task 3, enters "n"
**Then**:
- Cancellation message displayed
- Task 3 still in list
- Task 3 unchanged (no fields modified)

### Test Case 3: Cancel Deletion with Empty Input
**Given**: Task list has task with ID 1
**When**: User starts delete for task 1, presses Enter (empty)
**Then**:
- Treated as "no" (cancellation)
- Task 1 still in list

### Test Case 4: Cancel with Invalid Confirmation
**Given**: Task list has task with ID 1
**When**: User enters "maybe" for confirmation
**Then**:
- Treated as "no" (safe default)
- Task 1 still in list

### Test Case 5: Task Not Found
**Given**: No task with ID 99
**When**: User enters ID 99
**Then**:
- Error: "Task with ID 99 not found"
- No deletion attempt
- Return to menu

### Test Case 6: Invalid ID (Non-Numeric)
**Given**: Delete task flow
**When**: User enters "abc" as task ID
**Then**:
- Error: "Invalid ID. Please enter a number"
- Re-prompt for task ID
- Can retry with valid ID

### Test Case 7: Case-Insensitive Confirmation
**Given**: Task exists with ID 1
**When**: User confirms with "YES", "Yes", "Y", "yes"
**Then**:
- All variations accepted as confirmation
- Task deleted in all cases

### Test Case 8: IDs Not Reused
**Given**: Tasks with IDs 1, 2, 3
**When**: Delete task 2, then add new task
**Then**:
- Deleted task 2 removed
- New task gets ID 4 (not 2)
- IDs remain: 1, 3, 4

### Test Case 9: Delete Only Task
**Given**: Task list has only one task (ID 1)
**When**: User deletes task 1
**Then**:
- Task deleted
- Task list becomes empty
- "View tasks" shows empty message

### Test Case 10: Delete Completed Task
**Given**: Task with ID 5 is marked complete
**When**: User deletes task 5
**Then**:
- Completed task can be deleted
- Deletion works same as pending task

## Example Interactions

### Example 1: Successful Deletion
```
Main Menu:
  ...
  4. Delete task
  ...
Enter your choice (1-6): 4

--- Delete Task ---
Enter task ID to delete: 3

Task to delete:
  ID: 3
  Title: Finish homework
  Description: Math and Science assignments
  Status: Pending

⚠️  This action cannot be undone!
Are you sure you want to delete this task? (y/n): y

✓ Task deleted successfully!
  Deleted task:
  - ID: 3
  - Title: Finish homework
  - Description: Math and Science assignments

Press Enter to return to menu...
```

### Example 2: Cancel Deletion
```
Enter your choice (1-6): 4

--- Delete Task ---
Enter task ID to delete: 2

Task to delete:
  ID: 2
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: Pending

⚠️  This action cannot be undone!
Are you sure you want to delete this task? (y/n): n

Deletion canceled. Task not deleted.

Press Enter to return to menu...
```

### Example 3: Task Not Found
```
Enter your choice (1-6): 4

--- Delete Task ---
Enter task ID to delete: 99

❌ Error: Task with ID 99 not found.

Press Enter to return to menu...
```

### Example 4: Invalid ID with Retry
```
Enter your choice (1-6): 4

--- Delete Task ---
Enter task ID to delete: abc
❌ Error: Invalid ID. Please enter a number.
Enter task ID to delete: 1

Task to delete:
  ID: 1
  Title: Buy milk
  ...
```

### Example 5: Uppercase Confirmation
```
Enter your choice (1-6): 4

--- Delete Task ---
Enter task ID to delete: 5

Task to delete:
  ID: 5
  Title: Read book
  Description: Chapter 7
  Status: Complete

⚠️  This action cannot be undone!
Are you sure you want to delete this task? (y/n): YES

✓ Task deleted successfully!
  Deleted task:
  - ID: 5
  - Title: Read book
  - Description: Chapter 7

Press Enter to return to menu...
```

## Non-Functional Requirements

### Performance
- Task lookup should be instant (<10ms)
- Deletion operation should be instant (<10ms)
- No lag in user interaction

### Usability
- Task details clearly shown before confirmation
- Warning is prominent and clear
- Confirmation prompt is obvious (y/n)
- Safe default (anything except yes = no)
- Cannot accidentally delete without confirmation

### Reliability
- No data corruption possible
- Other tasks never affected
- IDs never reused (prevents confusion)
- Deletion is atomic (complete or no change)

### Safety
- Requires explicit confirmation
- Shows what will be deleted
- Warns about permanence
- Easy to cancel

## Dependencies

### Depends On
- Task dataclass (models.py)
- TaskManager.get_task_by_id() method
- TaskManager.delete_task() method

### Required By
- Users need this to remove unwanted tasks
- Complements add/update for full CRUD

## Edge Cases

### Edge Case 1: Delete While Viewing Details
**Scenario**: User sees task in list, deletes it
**Expected**: Task removed, no longer in list
**Solution**: Standard deletion flow

### Edge Case 2: Delete Same Task Twice
**Scenario**: User tries to delete already-deleted task
**Expected**: "Task not found" error
**Solution**: ID lookup fails, shows error

### Edge Case 3: All Tasks Deleted
**Scenario**: User deletes all tasks, list becomes empty
**Expected**: "View tasks" shows empty message, next task gets next ID
**Solution**: Empty list is valid state, ID counter continues

### Edge Case 4: Rapid Deletions
**Scenario**: User deletes multiple tasks in quick succession
**Expected**: Each deletion independent and successful
**Solution**: No race conditions (single-threaded, in-memory)

## Future Enhancements (Out of Scope for Phase I)

- ⭕ Undo delete (restore recently deleted task)
- ⭕ Soft delete / Archive (hide instead of delete)
- ⭕ Bulk delete (delete multiple tasks at once)
- ⭕ Delete by criteria (delete all completed, etc.)
- ⭕ Trash/Recycle bin (temporary storage before permanent delete)
- ⭕ Confirmation bypass with flag (--force)
- ⭕ Delete history log

## Safety Considerations

### Preventing Accidental Deletion

1. **Show full details**: User sees exactly what they're deleting
2. **Explicit confirmation**: Must type "y" or "yes"
3. **Prominent warning**: "⚠️ This action cannot be undone!"
4. **Safe default**: Anything except yes = cancel
5. **No shortcuts**: No "delete all" or bulk operations

### Data Integrity

1. **Atomic operation**: Delete succeeds completely or not at all
2. **No orphans**: No related data to clean up (Phase I is simple)
3. **ID integrity**: IDs never reused
4. **No side effects**: Other tasks unaffected

## Acceptance Validation

### How to Verify This Feature Works

1. **Add tasks**: Create 5 tasks (IDs 1-5)
2. **Delete middle task**: Delete task 3, confirm, verify success
3. **Check list**: Use "View tasks", verify task 3 gone, others remain
4. **Check IDs**: Add new task, verify it gets ID 6 (not 3)
5. **Cancel deletion**: Start delete, enter "n", verify task unchanged
6. **Task not found**: Try to delete ID 99, verify error
7. **Invalid ID**: Enter "abc", verify error and re-prompt
8. **Case insensitive**: Confirm with "YES", "yes", "Y", verify all work
9. **Empty confirmation**: Press Enter at prompt, verify cancellation
10. **Delete all**: Delete all tasks, verify empty list message

### Success Criteria Met When:
- ✅ All 14 "Must Have" acceptance criteria pass
- ✅ All 10 test scenarios pass
- ✅ All 5 example interactions work as shown
- ✅ No accidental deletions possible
- ✅ Data integrity maintained

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Feature Status**: Ready for Implementation
**Next Step**: Generate code with Claude Code using this specification
