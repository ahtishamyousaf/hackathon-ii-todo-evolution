# Feature Specification: View Notes List

**Feature ID**: N002
**Feature Name**: View Notes List
**Phase**: Demo for Reusable Intelligence Bonus
**Version**: 1.0.0
**Last Updated**: 2025-12-10
**Status**: Specification

---

## Overview

### Purpose
Display all notes in a formatted, easy-to-read list showing key information including ID, category, title, archive status, and creation date. Helps users see their notes at a glance and find specific notes by ID.

### Scope
- ✅ **In Scope**: Display all notes, formatted table, category indicators, archive status, sorting by ID, empty state, statistics
- ❌ **Out of Scope**: Filtering by category, searching, pagination, sorting by other fields (future phases)

### User Story
**As a** user
**I want to** view all my notes in a clear, organized list
**So that** I can see what notes I have and find the ID of the note I want to work with

---

## Acceptance Criteria

### AC1: Display All Notes
- System displays all notes in the list
- Notes are shown in ascending order by ID
- Each note shows: ID, Category, Title, Archive Status, Created Date

### AC2: Table Formatting
- Notes displayed in table with columns: ID | Category | Title | Archived | Created
- Column headers clearly labeled
- Separator line between header and data
- Columns aligned appropriately (ID right-aligned, text left-aligned)

### AC3: ID Display
- ID column right-aligned
- IDs displayed as integers
- Column width: 3 characters minimum

### AC4: Category Display
- Category shown with icon indicators:
  - 📝 = personal
  - 💼 = work
  - 💡 = ideas
  - 📁 = other
- Full category name shown after icon

### AC5: Title Display
- Title column shows full title if ≤40 characters
- If title >40 characters, show first 37 characters + "..."
- Preserve title casing and special characters

### AC6: Archive Status Display
- Archive status shown with indicators:
  - 📦 Archived = true
  - ○ Active = false
- Clear visual distinction

### AC7: Created Date Display
- Created date in format "YYYY-MM-DD HH:MM"
- Consistent datetime formatting
- Timezone consistent with system

### AC8: Empty State
- If no notes exist, display: "No notes yet. Add your first note with option 1!"
- Show helpful message guiding user to add notes
- Don't show table headers when empty

### AC9: Statistics Summary
- After table, show summary line
- Format: "Total: X notes (Y personal, Z work, W ideas, V other | A archived)"
- Count notes by category and archive status

### AC10: Sorting
- Notes always sorted by ID ascending
- Newest notes (highest ID) appear last

### AC11: Return to Menu
- After displaying, system pauses for user to review
- Press Enter to return to main menu
- Clear transition back to menu

---

## User Interaction Flow

### Normal Flow

1. **User selects** "View Notes" from menu (option 2)
2. **System retrieves** all notes from NoteManager
3. **System sorts** notes by ID ascending
4. **System displays** table header
5. **System displays** separator line
6. **System iterates** through notes, displaying each row
7. **System displays** statistics summary
8. **System prompts** "Press Enter to continue..."
9. **User presses** Enter
10. **System returns** to main menu

### Alternative Flows

**Alt 1: No Notes**
- Step 2: NoteManager returns empty list
- System displays: "No notes yet. Add your first note with option 1!"
- System skips steps 4-7
- System prompts "Press Enter to continue..."
- System returns to main menu

**Alt 2: Single Note**
- Step 2: NoteManager returns one note
- System displays table with header, separator, single row
- Statistics: "Total: 1 note (1 personal | 0 archived)"
- Singular "note" instead of "notes"

---

## Data Requirements

### Note Display Model

For each note, display:
- **id**: Integer, right-aligned
- **category**: String with icon indicator
- **title**: String, truncated if >40 chars
- **is_archived**: Boolean, shown as indicator
- **created_at**: Datetime, formatted

### Table Layout

```
ID  | Category      | Title                                    | Archived | Created
----|---------------|------------------------------------------|----------|------------------
  1 | 📝 personal   | My First Note                            | ○ Active | 2025-12-10 15:30
  2 | 💼 work       | Meeting Notes                            | ○ Active | 2025-12-10 15:31
  3 | 💡 ideas      | App Feature Ideas                        | 📦 Archived | 2025-12-10 15:32
  4 | 📁 other      | This is a very long note title that g... | ○ Active | 2025-12-10 15:33

Total: 4 notes (1 personal, 1 work, 1 ideas, 1 other | 1 archived)
```

### Column Widths

| Column | Width | Alignment |
|--------|-------|-----------|
| ID | 3-4 chars | Right |
| Category | 15 chars | Left |
| Title | 40 chars | Left |
| Archived | 10 chars | Left |
| Created | 17 chars | Left |

---

## Display Formatting

### Category Icons

```python
CATEGORY_ICONS = {
    "personal": "📝",
    "work": "💼",
    "ideas": "💡",
    "other": "📁"
}

def format_category(category: str) -> str:
    """Format category with icon."""
    icon = CATEGORY_ICONS.get(category, "📁")
    return f"{icon} {category}"
```

### Archive Status Icons

```python
def format_archive_status(is_archived: bool) -> str:
    """Format archive status with indicator."""
    return "📦 Archived" if is_archived else "○ Active"
```

### Title Truncation

```python
def format_title(title: str, max_length: int = 40) -> str:
    """Truncate title if longer than max_length."""
    if len(title) <= max_length:
        return title
    return title[:37] + "..."
```

### Date Formatting

```python
def format_created_date(created_at: datetime) -> str:
    """Format creation date."""
    return created_at.strftime("%Y-%m-%d %H:%M")
```

---

## Implementation Guidance

### CLI Layer (cli.py)

```python
def format_note_list(notes: List[Note]) -> str:
    """
    Format notes into a table string.

    Args:
        notes: List of Note objects to display

    Returns:
        Formatted table string with headers, rows, and summary
    """
    if not notes:
        return ""

    # Sort by ID
    sorted_notes = sorted(notes, key=lambda n: n.id)

    # Build table
    lines = []

    # Header
    lines.append("ID  | Category      | Title                                    | Archived    | Created")
    lines.append("----|---------------|------------------------------------------|-------------|------------------")

    # Rows
    for note in sorted_notes:
        id_str = f"{note.id:>3}"
        category_str = format_category(note.category).ljust(15)
        title_str = format_title(note.title, 40).ljust(40)
        archived_str = format_archive_status(note.is_archived).ljust(12)
        created_str = format_created_date(note.created_at)

        lines.append(f"{id_str} | {category_str} | {title_str} | {archived_str} | {created_str}")

    # Statistics
    stats = calculate_statistics(sorted_notes)
    lines.append("")
    lines.append(format_statistics(stats))

    return "\n".join(lines)


def calculate_statistics(notes: List[Note]) -> dict:
    """Calculate note statistics."""
    total = len(notes)
    by_category = {"personal": 0, "work": 0, "ideas": 0, "other": 0}
    archived_count = 0

    for note in notes:
        by_category[note.category] += 1
        if note.is_archived:
            archived_count += 1

    return {
        "total": total,
        "by_category": by_category,
        "archived": archived_count
    }


def format_statistics(stats: dict) -> str:
    """Format statistics summary line."""
    total = stats["total"]
    by_cat = stats["by_category"]
    archived = stats["archived"]

    note_word = "note" if total == 1 else "notes"

    cat_parts = []
    for cat in ["personal", "work", "ideas", "other"]:
        if by_cat[cat] > 0:
            cat_parts.append(f"{by_cat[cat]} {cat}")

    cat_summary = ", ".join(cat_parts)

    return f"Total: {total} {note_word} ({cat_summary} | {archived} archived)"


def handle_view_notes(manager: NoteManager) -> None:
    """Handle the view notes workflow."""
    print("\n=== View Notes ===\n")

    notes = manager.get_all_notes()

    if not notes:
        print("No notes yet. Add your first note with option 1!")
    else:
        formatted = format_note_list(notes)
        print(formatted)

    print("\nPress Enter to continue...")
    input()
```

### Business Logic Layer (note_manager.py)

```python
class NoteManager:
    def get_all_notes(self) -> List[Note]:
        """
        Get all notes.

        Returns:
        Copy of the notes list (to prevent external modification)
        """
        return self._notes.copy()
```

---

## Test Scenarios

### Test 1: Empty Note List
**Preconditions**: No notes in system

**Expected**:
```
=== View Notes ===

No notes yet. Add your first note with option 1!

Press Enter to continue...
```

### Test 2: Single Note
**Preconditions**: One note created (ID: 1, Title: "My Note", Category: personal, Active, Created: 2025-12-10 15:30)

**Expected**:
```
=== View Notes ===

ID  | Category      | Title                                    | Archived    | Created
----|---------------|------------------------------------------|-------------|------------------
  1 | 📝 personal   | My Note                                  | ○ Active    | 2025-12-10 15:30

Total: 1 note (1 personal | 0 archived)

Press Enter to continue...
```

### Test 3: Multiple Notes
**Preconditions**: 4 notes with different categories and archive states

**Expected**:
```
=== View Notes ===

ID  | Category      | Title                                    | Archived    | Created
----|---------------|------------------------------------------|-------------|------------------
  1 | 📝 personal   | My First Note                            | ○ Active    | 2025-12-10 15:30
  2 | 💼 work       | Meeting Notes                            | ○ Active    | 2025-12-10 15:31
  3 | 💡 ideas      | App Feature Ideas                        | 📦 Archived | 2025-12-10 15:32
  4 | 📁 other      | Random Thoughts                          | ○ Active    | 2025-12-10 15:33

Total: 4 notes (1 personal, 1 work, 1 ideas, 1 other | 1 archived)

Press Enter to continue...
```

### Test 4: Long Title Truncation
**Preconditions**: Note with title longer than 40 characters

**Expected**:
```
ID  | Category      | Title                                    | Archived    | Created
----|---------------|------------------------------------------|-------------|------------------
  1 | 📝 personal   | This is a very long note title that g... | ○ Active    | 2025-12-10 15:30

Total: 1 note (1 personal | 0 archived)
```

### Test 5: All Categories
**Preconditions**: Notes in all 4 categories

**Expected**:
- All category icons displayed correctly
- Statistics shows counts for all categories
- Format: "Total: 4 notes (1 personal, 1 work, 1 ideas, 1 other | 0 archived)"

### Test 6: All Archived
**Preconditions**: 3 notes, all archived

**Expected**:
- All notes show "📦 Archived"
- Statistics: "Total: 3 notes (... | 3 archived)"

### Test 7: Sorting by ID
**Preconditions**: Notes created in order 1, 3, 2 (IDs assigned in creation order)

**Expected**:
- Notes displayed in order: 1, 2, 3 (ascending by ID)
- Consistent ordering regardless of creation sequence

### Test 8: Unicode in Titles
**Preconditions**: Note with Arabic/Chinese/emoji characters

**Expected**:
- Unicode characters display correctly
- No encoding errors
- Truncation works correctly with unicode

---

## Example Interactions

### Example 1: View Empty List

```
==========================================
   Note Console App - Phase I
==========================================
1. Add Note
2. View Notes
3. Update Note
4. Delete Note
5. Toggle Archive
6. Exit

Enter your choice (1-6): 2

=== View Notes ===

No notes yet. Add your first note with option 1!

Press Enter to continue...
[User presses Enter]

==========================================
   Note Console App - Phase I
...
```

### Example 2: View Multiple Notes

```
Enter your choice (1-6): 2

=== View Notes ===

ID  | Category      | Title                                    | Archived    | Created
----|---------------|------------------------------------------|-------------|------------------
  1 | 📝 personal   | Grocery List                             | ○ Active    | 2025-12-10 14:20
  2 | 💼 work       | Q4 Project Plan                          | ○ Active    | 2025-12-10 14:25
  3 | 💡 ideas      | App Features Brainstorm                  | ○ Active    | 2025-12-10 14:30
  4 | 📁 other      | Random Thoughts                          | 📦 Archived | 2025-12-10 14:35
  5 | 💼 work       | Meeting Notes - Weekly Standup           | ○ Active    | 2025-12-10 15:00

Total: 5 notes (1 personal, 2 work, 1 ideas, 1 other | 1 archived)

Press Enter to continue...
```

### Example 3: Long Titles

```
Enter your choice (1-6): 2

=== View Notes ===

ID  | Category      | Title                                    | Archived    | Created
----|---------------|------------------------------------------|-------------|------------------
  1 | 💡 ideas      | Revolutionary AI-Powered Task Manageme... | ○ Active    | 2025-12-10 15:30
  2 | 📝 personal   | Short Title                              | ○ Active    | 2025-12-10 15:31

Total: 2 notes (1 personal, 1 ideas | 0 archived)

Press Enter to continue...
```

---

## Non-Functional Requirements

### Performance
- Display completes in <200ms for up to 100 notes
- No lag when viewing large lists

### Usability
- Clear visual hierarchy with table structure
- Easy to scan and find specific notes
- Icons make categories immediately recognizable
- Statistics provide quick overview

### Accessibility
- Plain text output works in all terminals
- Icons are supplemented with text labels
- High contrast for readability

### Maintainability
- Formatting logic separated from business logic
- Easy to adjust column widths
- Easy to add new category icons

---

## Notes

### Design Decisions

**Why Icons for Categories?**
- Visual distinction makes scanning faster
- More engaging than plain text
- Common pattern in modern CLI tools

**Why 40 Character Title Limit?**
- Balances readability with information density
- Fits comfortably in standard 80-120 char terminal width
- User can view full title in update/delete operations

**Why Ascending ID Sort?**
- Predictable ordering
- Newest notes at bottom (natural reading flow)
- Easy to find specific ID

**Why Show Statistics?**
- Gives quick overview without counting manually
- Helps user understand note distribution
- Shows archived count at a glance

---

**Generated by**: CRUD Spec Generator Skill v1.0.0
**Template**: Phase I Task Specification Pattern
**Bonus Feature**: Reusable Intelligence (+200 points)
