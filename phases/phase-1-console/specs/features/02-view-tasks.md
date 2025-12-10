# Feature Specification: View Task List

## Feature Overview

**Feature Name**: View Task List
**Feature ID**: F002
**Priority**: Critical (Core CRUD operation)
**Phase**: I - Console Application
**Status**: Specification Complete

## User Story

**As a** user
**I want to** see all my tasks in a clear, organized list
**So that** I can review what needs to be done and track my progress

## Feature Description

The View Task List feature displays all tasks in the todo list in a well-formatted table. Users can see each task's ID, title, completion status, and creation date at a glance. The feature also shows summary statistics (total tasks, completed vs pending).

### Success Outcome
User views their task list and can quickly understand what tasks exist, which are complete, which are pending, and when each was created.

## Acceptance Criteria

### Must Have (Required)
- ✅ AC1: Display all tasks in a formatted table
- ✅ AC2: Show task ID for each task
- ✅ AC3: Show task title for each task
- ✅ AC4: Show completion status with visual indicator (✓/○)
- ✅ AC5: Show creation date in readable format
- ✅ AC6: Display summary statistics (total, completed, pending)
- ✅ AC7: Handle empty task list gracefully
- ✅ AC8: Sort tasks by ID (oldest first)
- ✅ AC9: Return to main menu after viewing

### Should Have (Important)
- ✅ AC10: Truncate long titles to fit in console
- ✅ AC11: Align columns properly
- ✅ AC12: Clear visual separation between header and data
- ✅ AC13: Show friendly message when list is empty

### Nice to Have (Enhancement)
- ⭕ AC14: Filter by status (show only pending/completed) - future
- ⭕ AC15: Sort by different criteria - future
- ⭕ AC16: Pagination for very long lists - future

## User Interaction Flow

### Normal Flow - With Tasks
```
1. User selects "View all tasks" from main menu (option 2)
2. System retrieves all tasks from TaskManager
3. System sorts tasks by ID (ascending)
4. System displays "--- Your Tasks ---" header
5. System displays table header (ID | Status | Title | Created)
6. System displays separator line
7. For each task:
   - Format ID (right-aligned, width 4)
   - Format status (✓ Done / ○ Pending, width 10)
   - Format title (truncated to 25 chars if needed, left-aligned)
   - Format creation date (YYYY-MM-DD HH:MM format)
8. System displays summary line (Total: X tasks (Y completed, Z pending))
9. System prompts: "Press Enter to return to menu..."
10. User returns to main menu
```

### Alternative Flow - Empty List
```
1. User selects "View all tasks" from main menu (option 2)
2. System retrieves all tasks (empty list)
3. System displays "--- Your Tasks ---" header
4. System displays: "No tasks yet. Add your first task!"
5. System prompts: "Press Enter to return to menu..."
6. User returns to main menu
```

## Data Requirements

### Input Data
- None (no user input required)

### Output Data (For Each Task)
| Field | Display Name | Format | Width |
|-------|--------------|--------|-------|
| id | ID | Integer, right-aligned | 4 chars |
| completed | Status | "✓ Done" or "○ Pending" | 10 chars |
| title | Title | String, truncated, left-aligned | 25 chars |
| created_at | Created | "YYYY-MM-DD HH:MM" | 16 chars |

### Summary Statistics
| Statistic | Calculation | Display |
|-----------|-------------|---------|
| Total | Count of all tasks | "Total: X tasks" |
| Completed | Count where completed=True | "Y completed" |
| Pending | Count where completed=False | "Z pending" |

## Formatting Specifications

### Table Layout
```
--- Your Tasks ---

ID  | Status    | Title                | Created
----|-----------|---------------------|-------------------
1   | ○ Pending | Buy groceries       | 2025-12-10 14:30
2   | ✓ Done    | Call dentist        | 2025-12-10 13:15
3   | ○ Pending | Finish homework     | 2025-12-10 15:45

Total: 3 tasks (1 completed, 2 pending)

Press Enter to return to menu...
```

### Column Specifications

#### ID Column
- Width: 4 characters
- Alignment: Right
- Format: Integer with leading spaces
- Example: "   1", "  42", " 123"

#### Status Column
- Width: 10 characters (including indicator and label)
- Alignment: Left
- Complete: "✓ Done    " (✓ + space + "Done" + padding)
- Pending: "○ Pending " (○ + space + "Pending")

#### Title Column
- Width: 25 characters
- Alignment: Left
- Truncation: If title > 25 chars, show first 22 chars + "..."
- Padding: Right-padded with spaces if shorter
- Example: "Buy groceries            " (17 chars + 8 spaces)

#### Created Column
- Width: 16 characters
- Alignment: Left
- Format: "YYYY-MM-DD HH:MM"
- Example: "2025-12-10 14:30"

### Empty List Display
```
--- Your Tasks ---

No tasks yet. Add your first task!

Press Enter to return to menu...
```

## Sorting Rules

### Primary Sort
- Sort by ID ascending (1, 2, 3, ...)
- This is natural chronological order (oldest first)

### Why This Order?
- IDs are sequential by creation time
- Users see tasks in the order they created them
- Predictable and consistent

### Future Enhancements (Out of Scope)
- Sort by status (completed last)
- Sort by title alphabetically
- Sort by date (newest first option)
- Custom sort order

## Title Truncation Logic

### Rules
1. If title length ≤ 25: Display full title, pad right with spaces
2. If title length > 25: Display first 22 characters + "..."

### Examples
| Original Title | Length | Displayed Title |
|---------------|--------|-----------------|
| "Buy milk" | 9 | "Buy milk                " (+ 16 spaces) |
| "Call dentist for appointment" | 29 | "Call dentist for appo..." |
| "Finish homework assignment for math class tomorrow" | 51 | "Finish homework assig..." |

### Why Truncate?
- Console width is limited (typically 80 chars)
- Table must fit on one screen
- User can see full title in other features (update, view details)

## Error Handling

### Error Cases

#### E1: System Error Retrieving Tasks
**Condition**: Exception when calling get_all_tasks()
**Error Message**: "Error: Unable to retrieve tasks. Please try again."
**Action**: Display error and return to menu
**Return**: Main menu

### Error Display Format
```
--- Your Tasks ---
❌ Error: Unable to retrieve tasks. Please try again.

Press Enter to return to menu...
```

## Success Messages

No explicit success message needed - the task list itself is the success state.

## Implementation Guidance

### CLI Layer (cli.py)

```python
def handle_view_tasks(manager: TaskManager) -> None:
    """Handle the view tasks user interaction."""
    print("\n--- Your Tasks ---\n")

    try:
        tasks = manager.get_all_tasks()

        if not tasks:
            print("No tasks yet. Add your first task!")
        else:
            # Display table
            print(format_task_list(tasks))

    except Exception as e:
        display_error("Unable to retrieve tasks. Please try again.")

    input("\nPress Enter to return to menu...")


def format_task_list(tasks: List[Task]) -> str:
    """Format task list as a table.

    Args:
        tasks: List of Task objects

    Returns:
        Formatted string with table
    """
    # Sort by ID
    sorted_tasks = sorted(tasks, key=lambda t: t.id)

    # Table header
    lines = []
    lines.append("ID  | Status    | Title                | Created")
    lines.append("----|-----------|---------------------|-------------------")

    # Table rows
    for task in sorted_tasks:
        # Format ID (right-aligned, width 4)
        id_str = f"{task.id:>3} "

        # Format status
        status_str = "✓ Done    " if task.completed else "○ Pending "

        # Format title (truncate if needed)
        if len(task.title) <= 25:
            title_str = task.title.ljust(25)
        else:
            title_str = task.title[:22] + "..."

        # Format date
        date_str = task.created_at.strftime("%Y-%m-%d %H:%M")

        # Combine row
        row = f"{id_str}| {status_str}| {title_str}| {date_str}"
        lines.append(row)

    # Summary statistics
    total = len(sorted_tasks)
    completed = sum(1 for t in sorted_tasks if t.completed)
    pending = total - completed

    lines.append("")
    lines.append(f"Total: {total} tasks ({completed} completed, {pending} pending)")

    return "\n".join(lines)
```

### Business Logic Layer (task_manager.py)

```python
def get_all_tasks(self) -> List[Task]:
    """Get all tasks.

    Returns:
        List of all Task objects (copy of internal list)
    """
    # Return a copy to prevent external modification
    return self._tasks.copy()


def get_statistics(self) -> dict:
    """Get task statistics.

    Returns:
        Dictionary with total, completed, pending counts
    """
    total = len(self._tasks)
    completed = sum(1 for task in self._tasks if task.completed)
    pending = total - completed

    return {
        "total": total,
        "completed": completed,
        "pending": pending
    }
```

## Test Scenarios

### Test Case 1: View Empty List
**Given**: No tasks in the list
**When**: User selects "View all tasks"
**Then**:
- Header displayed: "--- Your Tasks ---"
- Message: "No tasks yet. Add your first task!"
- No table shown
- Return to menu prompt shown

### Test Case 2: View Single Task
**Given**: One task with ID 1, title "Buy milk", pending
**When**: User selects "View all tasks"
**Then**:
- Table header displayed
- One row with task details
- Summary: "Total: 1 tasks (0 completed, 1 pending)"

### Test Case 3: View Multiple Tasks
**Given**: Three tasks (2 pending, 1 completed)
**When**: User selects "View all tasks"
**Then**:
- Table shows all 3 tasks
- Tasks sorted by ID (1, 2, 3)
- Status indicators correct (✓/○)
- Summary: "Total: 3 tasks (1 completed, 2 pending)"

### Test Case 4: Long Title Truncation
**Given**: Task with 50-character title
**When**: User views task list
**Then**:
- Title shows first 22 chars + "..."
- Total displayed length is 25 chars
- Table alignment maintained

### Test Case 5: Many Tasks
**Given**: 20 tasks in the list
**When**: User views task list
**Then**:
- All 20 tasks displayed
- Scrolling works (console handles)
- Table format maintained
- Summary shows correct counts

### Test Case 6: Date Formatting
**Given**: Task created at 2025-12-10 09:05:03
**When**: User views task list
**Then**:
- Date displayed as "2025-12-10 09:05"
- Seconds not shown
- Consistent width (16 chars)

### Test Case 7: Status Indicators
**Given**: Mix of completed and pending tasks
**When**: User views task list
**Then**:
- Completed tasks show "✓ Done"
- Pending tasks show "○ Pending"
- Visual distinction clear

### Test Case 8: ID Sorting
**Given**: Tasks with IDs: 3, 1, 5, 2, 4
**When**: User views task list
**Then**:
- Tasks displayed in order: 1, 2, 3, 4, 5
- Oldest task (lowest ID) shown first

## Example Interactions

### Example 1: Empty List
```
Main Menu:
  ...
  2. View all tasks
  ...
Enter your choice (1-6): 2

--- Your Tasks ---

No tasks yet. Add your first task!

Press Enter to return to menu...
```

### Example 2: Single Task
```
Enter your choice (1-6): 2

--- Your Tasks ---

ID  | Status    | Title                | Created
----|-----------|---------------------|-------------------
1   | ○ Pending | Buy groceries       | 2025-12-10 14:30

Total: 1 tasks (0 completed, 1 pending)

Press Enter to return to menu...
```

### Example 3: Multiple Tasks Mixed Status
```
Enter your choice (1-6): 2

--- Your Tasks ---

ID  | Status    | Title                | Created
----|-----------|---------------------|-------------------
1   | ○ Pending | Buy groceries       | 2025-12-10 14:30
2   | ✓ Done    | Call dentist        | 2025-12-10 13:15
3   | ○ Pending | Finish homework     | 2025-12-10 15:45
4   | ✓ Done    | Pay electricity bil...| 2025-12-10 16:20
5   | ○ Pending | Read chapter 5      | 2025-12-10 17:00

Total: 5 tasks (2 completed, 3 pending)

Press Enter to return to menu...
```

### Example 4: Long Titles Truncated
```
Enter your choice (1-6): 2

--- Your Tasks ---

ID  | Status    | Title                | Created
----|-----------|---------------------|-------------------
1   | ○ Pending | Buy groceries for ...| 2025-12-10 14:30
2   | ○ Pending | Call dentist to sc...| 2025-12-10 15:15
3   | ○ Pending | Finish homework as...| 2025-12-10 16:45

Total: 3 tasks (0 completed, 3 pending)

Press Enter to return to menu...
```

## Non-Functional Requirements

### Performance
- Display should be instant for up to 100 tasks
- Acceptable performance for up to 1000 tasks
- Table formatting should be fast (<50ms)

### Usability
- Table must be readable at a glance
- Column alignment must be consistent
- Status indicators must be visually distinct
- Empty state must be encouraging (not negative)

### Reliability
- Must handle empty list without errors
- Must handle very long titles without breaking layout
- Must handle large numbers of tasks (within memory limits)

## Dependencies

### Depends On
- Task dataclass (models.py)
- TaskManager.get_all_tasks() method (task_manager.py)
- datetime formatting (Python standard library)

### Required By
- User needs this to see tasks they've added
- Other features reference IDs seen in this view

## Edge Cases

### Edge Case 1: Unicode in Titles
**Scenario**: Task title contains emoji or unicode characters
**Expected**: Display correctly in table (may affect column width)
**Solution**: Count characters, not bytes; emoji counts as 1-2 chars

### Edge Case 2: Very Large ID Numbers
**Scenario**: Task ID is 10000+ (thousands of tasks)
**Expected**: ID column may exceed 4 chars (accept overflow)
**Solution**: Use dynamic width or allow overflow for IDs > 999

### Edge Case 3: Tasks Created Same Second
**Scenario**: Multiple tasks have identical timestamps
**Expected**: Sort by ID (stable sort)
**Solution**: ID is tiebreaker (already used as primary sort)

### Edge Case 4: Console Too Narrow
**Scenario**: User's console is <70 chars wide
**Expected**: Table may wrap or truncate
**Solution**: Document minimum console width (80 chars recommended)

## Future Enhancements (Out of Scope for Phase I)

- ⭕ Filter by status (show only pending/completed)
- ⭕ Search/filter by title keyword
- ⭕ Sort by different columns (title, date, status)
- ⭕ Pagination for very long lists (show 20 at a time)
- ⭕ Show description preview in table
- ⭕ Color coding for status
- ⭕ Export to file (CSV, JSON)

## Acceptance Validation

### How to Verify This Feature Works

1. **View empty list**: Start fresh app, select option 2, verify empty message
2. **Add and view one task**: Add task, then view, verify it appears
3. **View multiple tasks**: Add 5 tasks, view, verify all appear sorted by ID
4. **Mark one complete**: Complete a task, view, verify ✓ appears
5. **Verify statistics**: Check total/completed/pending counts are accurate
6. **Test long title**: Add task with 50-char title, verify truncation
7. **Test table alignment**: All columns should be properly aligned
8. **Test return to menu**: After viewing, verify return to menu works

### Success Criteria Met When:
- ✅ All 9 "Must Have" acceptance criteria pass
- ✅ All 8 test scenarios pass
- ✅ All 4 example interactions work as shown
- ✅ Table is readable and well-formatted
- ✅ Empty state is friendly and encouraging

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Feature Status**: Ready for Implementation
**Next Step**: Generate code with Claude Code using this specification
