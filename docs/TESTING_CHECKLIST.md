# Phase I Manual Testing Checklist

**Date**: 2025-12-10
**Purpose**: Validate all 67 acceptance criteria and 44 test scenarios
**Time Estimate**: 30 minutes

---

## Quick Start

```bash
# Run the application
uv run python src/main.py
```

---

## Test Plan Structure

- **Feature 1: Add Task** (8 scenarios) → ~5 mins
- **Feature 2: View Tasks** (8 scenarios) → ~5 mins
- **Feature 3: Update Task** (10 scenarios) → ~7 mins
- **Feature 4: Delete Task** (10 scenarios) → ~7 mins
- **Feature 5: Mark Complete** (10 scenarios) → ~6 mins

**Total**: 46 test scenarios, ~30 minutes

---

## Feature 1: Add Task (8 Scenarios)

### ✅ Test 1.1: Valid Task Creation
**Steps**:
1. Select option 1 (Add Task)
2. Title: "Buy groceries"
3. Description: "Milk, eggs, bread"

**Expected**:
- ✓ Task created successfully
- Shows ID: 1, Title: "Buy groceries", Status: Pending
- Returns to menu

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 1.2: Empty Title Error
**Steps**:
1. Select option 1
2. Title: "" (press Enter without typing)

**Expected**:
- ❌ Error: "Title cannot be empty"
- Re-prompts for title

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 1.3: Title Too Long
**Steps**:
1. Select option 1
2. Title: "A" repeated 201 times (copy-paste: AAAAAAAAAA... 201 chars)

**Expected**:
- ❌ Error: "Title is too long (201/200 characters)"
- Re-prompts for title

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 1.4: Description Too Long
**Steps**:
1. Select option 1
2. Title: "Valid Title"
3. Description: "A" repeated 1001 times

**Expected**:
- ❌ Error: "Description is too long (1001/1000 characters)"
- Re-prompts for description

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 1.5: Empty Description (Allowed)
**Steps**:
1. Select option 1
2. Title: "Task without description"
3. Description: "" (press Enter)

**Expected**:
- ✓ Task created successfully
- Description shows as "(No description)"

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 1.6: Special Characters
**Steps**:
1. Select option 1
2. Title: "React & Vue: Comparison 🚀"
3. Description: "Test special chars: @#$%"

**Expected**:
- ✓ Task created successfully
- Special characters and emoji preserved

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 1.7: Whitespace Trimming
**Steps**:
1. Select option 1
2. Title: "   Spaces around   " (leading/trailing spaces)
3. Description: "   Test   "

**Expected**:
- ✓ Task created with trimmed text
- Title: "Spaces around" (no leading/trailing spaces)

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 1.8: Multiple Tasks Sequential
**Steps**:
1. Add Task 1: "First task"
2. Add Task 2: "Second task"
3. Add Task 3: "Third task"

**Expected**:
- IDs increment: 1, 2, 3
- All tasks created successfully

**Result**: [ ] Pass  [ ] Fail

---

## Feature 2: View Tasks (8 Scenarios)

### ✅ Test 2.1: Empty List
**Precondition**: Start fresh (no tasks)

**Steps**:
1. Select option 2 (View Tasks)

**Expected**:
- Shows: "No tasks yet. Add your first task with option 1!"
- No table displayed

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 2.2: Single Task
**Precondition**: Create 1 task

**Steps**:
1. Add task: "My Task"
2. Select option 2

**Expected**:
- Table with headers: ID | Status | Title | Created
- One row: "  1 | ○ Pending | My Task | 2025-12-10 HH:MM"
- Summary: "Total: 1 task (0 completed, 1 pending)"

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 2.3: Multiple Tasks
**Precondition**: Create 3 tasks

**Steps**:
1. Add 3 tasks with different titles
2. Select option 2

**Expected**:
- Table shows all 3 tasks
- IDs: 1, 2, 3 (ascending order)
- All show "○ Pending"
- Summary: "Total: 3 tasks (0 completed, 3 pending)"

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 2.4: Long Title Truncation
**Precondition**: Create task with long title

**Steps**:
1. Add task: "This is a very long title that exceeds twenty-five characters"
2. Select option 2

**Expected**:
- Title truncated: "This is a very long ti..." (first 22 + "...")
- Full title not shown in table

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 2.5: Mixed Status Tasks
**Precondition**: Create tasks with different statuses

**Steps**:
1. Add 3 tasks
2. Mark task 2 as complete (option 5, ID: 2)
3. Select option 2

**Expected**:
- Task 1: "○ Pending"
- Task 2: "✓ Done"
- Task 3: "○ Pending"
- Summary: "Total: 3 tasks (1 completed, 2 pending)"

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 2.6: Sorting by ID
**Precondition**: Tasks exist

**Steps**:
1. View tasks (should already be sorted)

**Expected**:
- Tasks always in ID order: 1, 2, 3, ...
- Consistent ordering

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 2.7: Date Format Consistency
**Precondition**: Create tasks at different times

**Steps**:
1. Add task, wait 1 minute, add another task
2. Select option 2

**Expected**:
- Dates in format: "YYYY-MM-DD HH:MM"
- Consistent formatting for all tasks

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 2.8: Unicode Display
**Precondition**: Create task with unicode

**Steps**:
1. Add task: "مثال" (Arabic) or "测试" (Chinese)
2. Select option 2

**Expected**:
- Unicode characters display correctly
- No encoding errors

**Result**: [ ] Pass  [ ] Fail

---

## Feature 3: Update Task (10 Scenarios)

### ✅ Test 3.1: Update Both Fields
**Precondition**: Task exists (ID: 1)

**Steps**:
1. Select option 3 (Update Task)
2. ID: 1
3. New title: "Updated Title"
4. New description: "Updated Description"

**Expected**:
- ✓ Task updated successfully
- Shows updated title and description
- updated_at timestamp changes
- created_at timestamp unchanged

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.2: Update Title Only
**Precondition**: Task exists

**Steps**:
1. Select option 3
2. ID: 1
3. New title: "Only Title Changed"
4. Description: Press Enter (keep current)

**Expected**:
- ✓ Task updated
- Title changed, description unchanged
- Message: "Updated: Title"

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.3: Update Description Only
**Precondition**: Task exists

**Steps**:
1. Select option 3
2. ID: 1
3. Title: Press Enter (keep current)
4. New description: "Only Description Changed"

**Expected**:
- ✓ Task updated
- Description changed, title unchanged
- Message: "Updated: Description"

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.4: No Changes (Both Enter)
**Precondition**: Task exists

**Steps**:
1. Select option 3
2. ID: 1
3. Title: Press Enter
4. Description: Press Enter

**Expected**:
- Message: "No changes made."
- Task unchanged

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.5: Invalid Task ID
**Precondition**: Only tasks 1-3 exist

**Steps**:
1. Select option 3
2. ID: 999 (doesn't exist)

**Expected**:
- ❌ Error: "Task ID 999 not found"
- Returns to menu

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.6: Empty Title Error
**Precondition**: Task exists

**Steps**:
1. Select option 3
2. ID: 1
3. Title: "" (empty string)

**Expected**:
- ❌ Error: "Title cannot be empty"
- Re-prompts for title OR allows Enter to keep current

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.7: Title Too Long
**Precondition**: Task exists

**Steps**:
1. Select option 3
2. ID: 1
3. Title: 201 characters

**Expected**:
- ❌ Error: "Title is too long"
- Re-prompts or rejects

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.8: Description Too Long
**Precondition**: Task exists

**Steps**:
1. Select option 3
2. ID: 1
3. Description: 1001 characters

**Expected**:
- ❌ Error: "Description is too long"
- Re-prompts or rejects

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.9: Timestamp Updates
**Precondition**: Task exists with known timestamps

**Steps**:
1. Note current created_at and updated_at
2. Update task
3. Check timestamps

**Expected**:
- created_at unchanged
- updated_at is newer than before

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 3.10: Update Completed Task
**Precondition**: Task marked as complete

**Steps**:
1. Mark task as complete
2. Update its title

**Expected**:
- ✓ Update successful
- Completion status unchanged
- updated_at changes

**Result**: [ ] Pass  [ ] Fail

---

## Feature 4: Delete Task (10 Scenarios)

### ✅ Test 4.1: Delete with Confirmation (y)
**Precondition**: Task exists

**Steps**:
1. Select option 4 (Delete Task)
2. ID: 1
3. Confirm: "y"

**Expected**:
- ⚠️ Warning displayed
- Shows task details
- ✓ Task deleted successfully
- Task no longer in list

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.2: Delete with Confirmation (yes)
**Precondition**: Task exists

**Steps**:
1. Select option 4
2. ID: 1
3. Confirm: "yes"

**Expected**:
- ✓ Task deleted (accepts "yes")
- Case-insensitive

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.3: Cancel Deletion (n)
**Precondition**: Task exists

**Steps**:
1. Select option 4
2. ID: 1
3. Confirm: "n"

**Expected**:
- Message: "Deletion cancelled"
- Task still exists

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.4: Cancel Deletion (no)
**Precondition**: Task exists

**Steps**:
1. Select option 4
2. ID: 1
3. Confirm: "no"

**Expected**:
- Deletion cancelled
- Task still exists

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.5: Cancel with Other Input
**Precondition**: Task exists

**Steps**:
1. Select option 4
2. ID: 1
3. Confirm: "maybe" or any other text

**Expected**:
- Deletion cancelled (only y/yes deletes)
- Task still exists

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.6: Invalid Task ID
**Precondition**: Limited tasks

**Steps**:
1. Select option 4
2. ID: 999

**Expected**:
- ❌ Error: "Task ID 999 not found"
- Returns to menu

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.7: Delete Last Task
**Precondition**: Only 1 task exists

**Steps**:
1. Delete the only task
2. View tasks

**Expected**:
- Task deleted
- List is empty
- View shows "No tasks yet"

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.8: ID Not Reused
**Precondition**: Delete task 2, keep 1 and 3

**Steps**:
1. Delete task ID 2
2. Add new task

**Expected**:
- New task gets ID 4 (not 2)
- IDs never reused

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.9: Delete Completed Task
**Precondition**: Task marked complete

**Steps**:
1. Mark task complete
2. Delete it

**Expected**:
- Shows task with "✓ Done" status
- Deletion works normally

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 4.10: Warning Message Display
**Precondition**: Any task

**Steps**:
1. Select delete
2. Check for warning

**Expected**:
- ⚠️ Warning: "This action cannot be undone!"
- Warning displayed BEFORE confirmation

**Result**: [ ] Pass  [ ] Fail

---

## Feature 5: Mark Complete (10 Scenarios)

### ✅ Test 5.1: Mark Pending as Complete
**Precondition**: Pending task exists

**Steps**:
1. Select option 5 (Mark Complete)
2. ID: 1

**Expected**:
- Status changes: "Pending → Complete"
- Indicator changes: "○ → ✓"
- ✓ Success message
- updated_at timestamp changes

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.2: Mark Complete as Pending (Toggle Back)
**Precondition**: Completed task exists

**Steps**:
1. Mark task complete (if not already)
2. Select option 5 again
3. Same ID

**Expected**:
- Status changes: "Complete → Pending"
- Indicator changes: "✓ → ○"
- Reversible toggle

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.3: Multiple Toggles
**Precondition**: Any task

**Steps**:
1. Toggle task 3 times (Pending → Complete → Pending → Complete)

**Expected**:
- Each toggle works correctly
- Status alternates each time
- updated_at updates each time

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.4: Invalid Task ID
**Precondition**: Limited tasks

**Steps**:
1. Select option 5
2. ID: 999

**Expected**:
- ❌ Error: "Task ID 999 not found"
- Returns to menu

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.5: Display Status Change
**Precondition**: Any task

**Steps**:
1. Note current status
2. Toggle status
3. Check message

**Expected**:
- Message shows: "Status changed: Pending → Complete" (or reverse)
- Clear before/after indication

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.6: No Confirmation Required
**Precondition**: Any task

**Steps**:
1. Select option 5
2. Enter ID

**Expected**:
- Status toggles immediately
- No confirmation prompt (reversible action)

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.7: Title/Description Unchanged
**Precondition**: Task with known title/description

**Steps**:
1. Note title and description
2. Toggle complete
3. Check title/description

**Expected**:
- Only completed field changes
- Title and description unchanged

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.8: Timestamp Updates
**Precondition**: Task with known timestamps

**Steps**:
1. Note created_at and updated_at
2. Toggle complete
3. Check timestamps

**Expected**:
- created_at unchanged
- updated_at is current time (newer)

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.9: View After Toggle
**Precondition**: Multiple tasks

**Steps**:
1. Toggle task 2 to complete
2. View all tasks

**Expected**:
- Task 2 shows "✓ Done"
- Others show "○ Pending"
- Statistics updated correctly

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test 5.10: Complete Statistics
**Precondition**: Multiple tasks, some complete

**Steps**:
1. Create 5 tasks
2. Mark 2 as complete
3. View tasks

**Expected**:
- Summary: "Total: 5 tasks (2 completed, 3 pending)"
- Count is accurate

**Result**: [ ] Pass  [ ] Fail

---

## General Functionality Tests

### ✅ Test G.1: Menu Display
**Steps**:
1. Start application

**Expected**:
- Banner with "=" (35 chars)
- Title: "Todo Console App - Phase I"
- 6 numbered options
- Clean formatting

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test G.2: Invalid Menu Choice
**Steps**:
1. At menu, enter: "7" or "0" or "abc"

**Expected**:
- ❌ Error: "Invalid choice"
- Re-shows menu

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test G.3: Exit Application
**Steps**:
1. Select option 6

**Expected**:
- Goodbye message
- Application exits cleanly
- No errors

**Result**: [ ] Pass  [ ] Fail

---

### ✅ Test G.4: Ctrl+C Interrupt
**Steps**:
1. Start app
2. Press Ctrl+C

**Expected**:
- Graceful exit message
- No stack trace

**Result**: [ ] Pass  [ ] Fail

---

## Testing Summary

**Total Tests**: 46
**Passed**: ___
**Failed**: ___
**Pass Rate**: ___%

### Critical Issues Found
_List any bugs or issues discovered:_

1.
2.
3.

### Notes
_Any observations or comments:_

---

## Sign-Off

- [ ] All critical features work correctly
- [ ] No crashes or errors during testing
- [ ] User experience is smooth and intuitive
- [ ] Error messages are clear and helpful
- [ ] Application is ready for demo and submission

**Tested By**: _______________
**Date**: 2025-12-10
**Time Spent**: _____ minutes
**Status**: [ ] APPROVED  [ ] NEEDS FIXES

---

**Next Steps After Testing**:
1. ✅ Fix any critical bugs found
2. ✅ Record 90-second demo video
3. ✅ Push to GitHub
4. ✅ Submit via Google Form
