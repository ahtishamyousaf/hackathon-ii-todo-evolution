# Feature Specification: Mark Task as Complete

## Feature Overview

**Feature Name**: Mark Task as Complete (Toggle Status)
**Feature ID**: F005
**Priority**: Critical (Core feature for task completion tracking)
**Phase**: I - Console Application
**Status**: Specification Complete

## User Story

**As a** user
**I want to** mark tasks as complete or incomplete
**So that** I can track my progress and see what's done and what still needs attention

## Feature Description

The Mark as Complete feature allows users to toggle the completion status of tasks. Users can mark pending tasks as complete or mark completed tasks back to pending. The feature updates the task's completed status and updated_at timestamp, providing immediate visual feedback through status indicators in the task list.

### Success Outcome
User toggles a task's completion status, receives confirmation showing the new status, and the change is immediately visible in the task list.

## Acceptance Criteria

### Must Have (Required)
- ✅ AC1: User can toggle task status by providing task ID
- ✅ AC2: System displays current task details and status
- ✅ AC3: Pending task becomes complete when toggled
- ✅ AC4: Complete task becomes pending when toggled
- ✅ AC5: System validates task ID exists
- ✅ AC6: System updates the updated_at timestamp
- ✅ AC7: System displays confirmation with new status
- ✅ AC8: Status change visible immediately in task list
- ✅ AC9: Status indicator changes (○ Pending ↔ ✓ Done)
- ✅ AC10: Title and description unchanged by status toggle

### Should Have (Important)
- ✅ AC11: Clear indication of old status → new status
- ✅ AC12: Helpful error messages for invalid inputs
- ✅ AC13: Task details shown for context

### Nice to Have (Enhancement)
- ⭕ AC14: Completion timestamp (when marked done) (future)
- ⭕ AC15: Completion statistics (% done) (future)
- ⭕ AC16: Batch toggle (multiple tasks) (future)

## User Interaction Flow

### Normal Flow - Mark Pending as Complete
```
1. User selects "Mark task as complete" from main menu (option 5)
2. System displays "--- Mark Task as Complete ---" header
3. System prompts: "Enter task ID: "
4. User enters task ID (e.g., "2")
5. System finds task by ID
6. System displays current task details:
   - ID
   - Title
   - Description
   - Current status: Pending
7. System toggles status (Pending → Complete)
8. System updates updated_at timestamp
9. System displays success message:
   - "Status changed: Pending → Complete"
   - Updated task details with new status
10. System prompts: "Press Enter to return to menu..."
11. User returns to main menu
```

### Alternative Flow A1: Mark Complete as Pending (Undo)
```
1-6. Same as normal flow, but task status is Complete
7. System toggles status (Complete → Pending)
8. System updates updated_at timestamp
9. System displays: "Status changed: Complete → Pending"
10-11. Return to menu
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
4. User enters non-numeric value (e.g., "xyz")
5. System displays error: "Invalid ID. Please enter a number"
6. System re-prompts: "Enter task ID: "
7. User can retry with valid ID
```

## Data Requirements

### Input Data
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| task_id | int | Yes | Must be valid integer, task must exist |

### Update Behavior
- **Current status = False (Pending)**: Change to True (Complete)
- **Current status = True (Complete)**: Change to False (Pending)
- **Toggle**: Simple boolean flip
- **No confirmation needed**: Status toggle is reversible

### Output Data (Updated Task)
| Field | Update Rule |
|-------|-------------|
| id | Never changes |
| title | Never changes |
| description | Never changes |
| completed | Toggled (True ↔ False) |
| created_at | Never changes |
| updated_at | Always set to current timestamp |

## Validation Rules

### Task ID Validation
1. **Must be integer**: Can be parsed as int
2. **Must exist**: Task with this ID must be in task list
3. **Positive**: ID must be > 0

### Business Rules
1. **Reversible**: Can toggle back and forth freely
2. **No confirmation**: Toggle is safe (reversible)
3. **Timestamp updated**: updated_at changes even if toggling back
4. **Other fields unchanged**: Only completed and updated_at change

## Status Representation

### Status Values
| Internal Value | Display Name | Indicator | Meaning |
|---------------|--------------|-----------|---------|
| False | Pending | ○ | Task not yet completed |
| True | Complete / Done | ✓ | Task finished |

### Status Transitions
```
Pending (False)  ─────────────────►  Complete (True)
     ○           Mark as Complete         ✓
     ◄─────────────────────────────
         Toggle again (undo)
```

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
**Return**: Stay in toggle flow

#### E3: System Error During Toggle
**Condition**: Unexpected error when updating task
**Error Message**: "Error: Failed to update task status. Please try again."
**Action**: Status not changed, return to menu
**Return**: Main menu

### Error Display Format
```
❌ Error: [Error message here]
```

## Success Messages

### Success Display Format
```
✓ Status changed: {old_status} → {new_status}

Updated task:
  ID: {id}
  Title: {title}
  Description: {description or "No description"}
  Status: {new_status}
  Updated: {timestamp}

Press Enter to return to menu...
```

### Examples
```
✓ Status changed: Pending → Complete

✓ Status changed: Complete → Pending
```

## Implementation Guidance

### CLI Layer (cli.py)

```python
def handle_toggle_complete(manager: TaskManager) -> None:
    """Handle the mark complete user interaction."""
    print("\n--- Mark Task as Complete ---")

    # Get and validate task ID
    while True:
        id_input = input("Enter task ID: ").strip()
        if not id_input:
            return  # Allow exit
        try:
            task_id = int(id_input)
            break
        except ValueError:
            display_error("Invalid ID. Please enter a number.")

    # Get task
    task = manager.get_task_by_id(task_id)
    if not task:
        display_error(f"Task with ID {task_id} not found.")
        input("\nPress Enter to return to menu...")
        return

    # Show current status
    old_status = "Complete" if task.completed else "Pending"
    print(f"\nCurrent task:")
    print(f"  ID: {task.id}")
    print(f"  Title: {task.title}")
    print(f"  Description: {task.description or 'No description'}")
    print(f"  Status: {old_status}")

    # Toggle status
    updated_task = manager.toggle_complete(task_id)

    if updated_task:
        new_status = "Complete" if updated_task.completed else "Pending"
        display_success(f"Status changed: {old_status} → {new_status}\n\n"
                       f"Updated task:\n"
                       f"  ID: {updated_task.id}\n"
                       f"  Title: {updated_task.title}\n"
                       f"  Description: {updated_task.description or 'No description'}\n"
                       f"  Status: {new_status}\n"
                       f"  Updated: {updated_task.updated_at.strftime('%Y-%m-%d %H:%M')}")
    else:
        display_error("Failed to update task status. Please try again.")

    input("\nPress Enter to return to menu...")
```

### Business Logic Layer (task_manager.py)

```python
def toggle_complete(self, task_id: int) -> Optional[Task]:
    """Toggle task completion status.

    Args:
        task_id: ID of task to toggle

    Returns:
        Updated Task object, or None if task not found
    """
    # Find task
    task = self.get_task_by_id(task_id)
    if not task:
        return None

    # Toggle completed status
    task.completed = not task.completed

    # Update timestamp
    task.updated_at = datetime.now()

    return task
```

## Test Scenarios

### Test Case 1: Mark Pending Task as Complete
**Given**: Task with ID 1, status = Pending (False)
**When**: User toggles status for task 1
**Then**:
- Status changes to Complete (True)
- updated_at timestamp updated
- created_at unchanged
- Title and description unchanged
- Status indicator in list shows ✓

### Test Case 2: Mark Complete Task as Pending
**Given**: Task with ID 2, status = Complete (True)
**When**: User toggles status for task 2
**Then**:
- Status changes to Pending (False)
- updated_at timestamp updated
- created_at unchanged
- Title and description unchanged
- Status indicator in list shows ○

### Test Case 3: Toggle Multiple Times
**Given**: Task with ID 3, status = Pending
**When**: User toggles three times (Pending → Complete → Pending → Complete)
**Then**:
- Each toggle changes status correctly
- Each toggle updates updated_at
- Final status is Complete
- All toggles work without errors

### Test Case 4: Task Not Found
**Given**: No task with ID 99
**When**: User enters ID 99
**Then**:
- Error: "Task with ID 99 not found"
- No status change
- Return to menu

### Test Case 5: Invalid ID (Non-Numeric)
**Given**: Toggle status flow
**When**: User enters "abc" as task ID
**Then**:
- Error: "Invalid ID. Please enter a number"
- Re-prompt for task ID
- Can retry with valid ID

### Test Case 6: Verify Timestamp Update
**Given**: Task created at 2025-12-10 10:00
**When**: User toggles status at 2025-12-10 15:00
**Then**:
- created_at still 2025-12-10 10:00
- updated_at now 2025-12-10 15:00
- Timestamps are different

### Test Case 7: Verify in Task List
**Given**: Task with ID 1, marked as complete
**When**: User views task list
**Then**:
- Task 1 shows "✓ Done" in status column
- Visual indicator clearly shows completion

### Test Case 8: Toggle Back Verification
**Given**: Task marked complete, then toggled back to pending
**When**: User views task list
**Then**:
- Task shows "○ Pending" in status column
- Task appears in pending category

### Test Case 9: All Fields Preserved
**Given**: Task with title "Buy milk", description "From store"
**When**: User toggles status
**Then**:
- Title still "Buy milk"
- Description still "From store"
- Only completed and updated_at changed

### Test Case 10: Empty Task List
**Given**: No tasks in list
**When**: User tries to toggle any ID
**Then**:
- Error: "Task with ID X not found"
- Graceful error handling

## Example Interactions

### Example 1: Mark Pending as Complete
```
Main Menu:
  ...
  5. Mark task as complete
  ...
Enter your choice (1-6): 5

--- Mark Task as Complete ---
Enter task ID: 2

Current task:
  ID: 2
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: Pending

✓ Status changed: Pending → Complete

Updated task:
  ID: 2
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: Complete
  Updated: 2025-12-10 16:30

Press Enter to return to menu...
```

### Example 2: Mark Complete as Pending (Undo)
```
Enter your choice (1-6): 5

--- Mark Task as Complete ---
Enter task ID: 2

Current task:
  ID: 2
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: Complete

✓ Status changed: Complete → Pending

Updated task:
  ID: 2
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: Pending
  Updated: 2025-12-10 16:35

Press Enter to return to menu...
```

### Example 3: Task Not Found
```
Enter your choice (1-6): 5

--- Mark Task as Complete ---
Enter task ID: 99

❌ Error: Task with ID 99 not found.

Press Enter to return to menu...
```

### Example 4: Invalid ID with Retry
```
Enter your choice (1-6): 5

--- Mark Task as Complete ---
Enter task ID: abc
❌ Error: Invalid ID. Please enter a number.
Enter task ID: 1

Current task:
  ID: 1
  Title: Call dentist
  ...
```

### Example 5: Task Without Description
```
Enter your choice (1-6): 5

--- Mark Task as Complete ---
Enter task ID: 3

Current task:
  ID: 3
  Title: Finish homework
  Description: No description
  Status: Pending

✓ Status changed: Pending → Complete

Updated task:
  ID: 3
  Title: Finish homework
  Description: No description
  Status: Complete
  Updated: 2025-12-10 17:00

Press Enter to return to menu...
```

## Non-Functional Requirements

### Performance
- Status toggle should be instant (<5ms)
- No lag in user interaction
- Timestamp update negligible overhead

### Usability
- Current status clearly shown before toggle
- New status clearly indicated after toggle
- Transition (old → new) explicitly stated
- No confirmation needed (toggle is reversible)
- Easy to understand what happened

### Reliability
- Toggle is atomic (complete or no change)
- No partial updates
- Status always consistent
- Other fields never affected

## Dependencies

### Depends On
- Task dataclass (models.py)
- TaskManager.get_task_by_id() method
- TaskManager.toggle_complete() method
- datetime module

### Required By
- Core feature for tracking task completion
- Integrates with View Tasks (shows status indicators)

## Edge Cases

### Edge Case 1: Toggle Immediately After Creation
**Scenario**: Create task, immediately mark complete
**Expected**: Works correctly, status changes to complete
**Solution**: No restrictions on timing

### Edge Case 2: Toggle Many Times Rapidly
**Scenario**: User toggles same task 10 times quickly
**Expected**: Each toggle works, final status depends on count (odd/even)
**Solution**: Each toggle independent, no rate limiting

### Edge Case 3: Toggle While Updating
**Scenario**: User updates task title, then immediately toggles status
**Expected**: Both operations independent and successful
**Solution**: Operations don't conflict

### Edge Case 4: All Tasks Complete
**Scenario**: User marks all tasks complete
**Expected**: All show ✓ in list, statistics show all complete
**Solution**: Valid state, no issues

### Edge Case 5: No Tasks Complete
**Scenario**: No tasks marked complete (all pending)
**Expected**: All show ○ in list, statistics show 0 complete
**Solution**: Valid state, no issues

## Future Enhancements (Out of Scope for Phase I)

- ⭕ Completion timestamp (track when marked done)
- ⭕ Completion duration (created to completed time)
- ⭕ Uncomplete reason (why marking back to pending)
- ⭕ Completion notes (context when completing)
- ⭕ Bulk toggle (mark multiple complete at once)
- ⭕ Auto-complete on due date (future phase)
- ⭕ Completion history (track toggle history)
- ⭕ Prevent re-opening (lock completed tasks)

## Status Tracking Benefits

### Why Track Completion Status?

1. **Progress Visibility**: See at a glance what's done
2. **Motivation**: Satisfaction of marking tasks complete
3. **Planning**: Know what still needs attention
4. **Statistics**: Track completion rate
5. **Organization**: Filter/sort by status (future)

### Design Philosophy

- **Simple**: Boolean status (complete/pending)
- **Flexible**: Can toggle freely (mistakes happen)
- **Reversible**: No permanent commitment
- **Visual**: Clear indicators (✓/○)
- **Immediate**: Change visible right away

## Acceptance Validation

### How to Verify This Feature Works

1. **Add tasks**: Create 3 tasks (all pending initially)
2. **Mark one complete**: Toggle task 1, verify status changes to Complete
3. **Check list**: Use "View tasks", verify task 1 shows ✓
4. **Mark back to pending**: Toggle task 1 again, verify status changes to Pending
5. **Check list**: Verify task 1 now shows ○
6. **Toggle multiple**: Mark tasks 1, 2, 3 complete, verify all show ✓
7. **Check statistics**: Verify "Total: 3 tasks (3 completed, 0 pending)"
8. **Task not found**: Try to toggle ID 99, verify error
9. **Invalid ID**: Enter "xyz", verify error and re-prompt
10. **Verify timestamps**: Each toggle updates updated_at, created_at unchanged

### Success Criteria Met When:
- ✅ All 13 "Must Have" acceptance criteria pass
- ✅ All 10 test scenarios pass
- ✅ All 5 example interactions work as shown
- ✅ Status indicators work correctly in task list
- ✅ Toggle is smooth and intuitive

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Feature Status**: Ready for Implementation
**Next Step**: Generate code with Claude Code using this specification

---

## 🎉 Phase I Specifications Complete!

All 5 feature specifications are now ready:
1. ✅ Add Task (F001)
2. ✅ View Task List (F002)
3. ✅ Update Task (F003)
4. ✅ Delete Task (F004)
5. ✅ Mark Task as Complete (F005)

**Next Steps**:
1. Review all specifications for consistency
2. Create CLAUDE.md with code generation instructions
3. Create README.md with project documentation
4. Use Claude Code to generate implementation
5. Test and validate all features
6. Record demo video
7. Submit to hackathon
