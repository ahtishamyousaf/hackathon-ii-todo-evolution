# Feature Specification: Add Note

**Feature ID**: N001
**Feature Name**: Add Note
**Phase**: Demo for Reusable Intelligence Bonus
**Version**: 1.0.0
**Last Updated**: 2025-12-10
**Status**: Specification

---

## Overview

### Purpose
Enable users to create new notes with a title and content. Notes are used for capturing ideas, reminders, or any text-based information the user wants to store.

### Scope
- ✅ **In Scope**: Create note with title and content, validate inputs, auto-generate ID and timestamps, display success confirmation
- ❌ **Out of Scope**: Categories, tags, rich text formatting, attachments, sharing (future phases)

### User Story
**As a** user
**I want to** create new notes with a title and content
**So that** I can capture and organize my ideas, reminders, and information

---

## Acceptance Criteria

### AC1: Note Creation
- User can add a note by providing a title and content
- System generates unique ID automatically
- System sets created_at and updated_at timestamps
- Note is stored in the in-memory list

### AC2: Title Validation
- Title is required (cannot be empty)
- Title must be 1-200 characters
- Whitespace-only titles are rejected
- Leading/trailing whitespace is trimmed

### AC3: Content Validation
- Content is required (cannot be empty)
- Content must be 1-5000 characters
- Whitespace-only content is rejected
- Line breaks and special characters are preserved

### AC4: ID Generation
- System assigns sequential integer ID starting from 1
- IDs are unique and never reused
- ID is automatically generated (user doesn't provide it)

### AC5: Timestamp Generation
- System sets created_at to current datetime when note is created
- System sets updated_at to same value as created_at initially
- Timestamps are in ISO 8601 format

### AC6: Category (Optional)
- Category is optional
- If provided, must be one of: personal, work, ideas, other
- Default category is "other" if not specified
- Invalid categories are rejected

### AC7: Archive Status
- New notes default to is_archived = false
- User cannot set archived status during creation (must use toggle feature)

### AC8: Success Feedback
- Display success message with note details
- Show: ID, title (truncated if >50 chars), category, created timestamp
- Format: "✓ Note created successfully! ID: {id}, Title: {title}, Category: {category}"

### AC9: Error Handling
- Display clear error messages for validation failures
- User can retry after error
- No partial note creation (all-or-nothing)

### AC10: Input Sanitization
- No HTML/script injection possible
- Special characters preserved but safely stored
- Emojis and unicode supported

---

## User Interaction Flow

### Normal Flow

1. **User selects** "Add Note" from menu (option 1)
2. **System prompts** "Enter note title (1-200 characters):"
3. **User enters** title text
4. **System prompts** "Enter note content (1-5000 characters, press Ctrl+D or Ctrl+Z when done):"
5. **User enters** content (multi-line supported)
6. **System prompts** "Enter category (personal/work/ideas/other) [default: other]:"
7. **User enters** category or presses Enter for default
8. **System validates** all inputs
9. **System creates** note with generated ID and timestamps
10. **System displays** success message with note details
11. **System returns** to main menu

### Alternative Flows

**Alt 1: Empty Title**
- Step 3: User enters empty string or whitespace only
- System displays: "❌ Error: Title cannot be empty. Please enter a title (1-200 characters)."
- System returns to step 2 (re-prompt)

**Alt 2: Title Too Long**
- Step 3: User enters title >200 characters
- System displays: "❌ Error: Title is too long (201/200 characters). Please shorten your title."
- System returns to step 2 (re-prompt)

**Alt 3: Empty Content**
- Step 5: User enters empty string or whitespace only
- System displays: "❌ Error: Content cannot be empty. Please enter content (1-5000 characters)."
- System returns to step 4 (re-prompt)

**Alt 4: Content Too Long**
- Step 5: User enters content >5000 characters
- System displays: "❌ Error: Content is too long (5234/5000 characters). Please shorten your content."
- System returns to step 4 (re-prompt)

**Alt 5: Invalid Category**
- Step 7: User enters "urgent" (not a valid category)
- System displays: "❌ Error: Invalid category. Must be one of: personal, work, ideas, other."
- System returns to step 6 (re-prompt)

**Alt 6: User Cancels**
- Any step: User presses Ctrl+C
- System displays: "❌ Note creation cancelled."
- System returns to main menu

---

## Data Requirements

### Note Model

```python
@dataclass
class Note:
    id: int                    # Auto-generated, sequential
    title: str                 # Required, 1-200 chars
    content: str               # Required, 1-5000 chars
    category: str              # Optional, enum: personal|work|ideas|other
    is_archived: bool          # Default: false
    created_at: datetime       # Auto-generated
    updated_at: datetime       # Auto-generated, initially same as created_at
```

### Field Specifications

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| id | int | Yes (auto) | Positive integer, unique | Auto-increment |
| title | str | Yes | 1-200 chars, non-empty | None |
| content | str | Yes | 1-5000 chars, non-empty | None |
| category | str | No | Enum: personal\|work\|ideas\|other | "other" |
| is_archived | bool | Yes (auto) | Boolean | false |
| created_at | datetime | Yes (auto) | Valid datetime | Current time |
| updated_at | datetime | Yes (auto) | Valid datetime | Current time |

---

## Validation Rules

### Title Validation

```python
def validate_title(title: str) -> tuple[bool, str]:
    """
    Validate note title.

    Returns:
        (True, "") if valid
        (False, error_message) if invalid
    """
    # Trim whitespace
    title = title.strip()

    # Check empty
    if not title:
        return False, "Title cannot be empty. Please enter a title (1-200 characters)."

    # Check length
    if len(title) > 200:
        return False, f"Title is too long ({len(title)}/200 characters). Please shorten your title."

    return True, ""
```

### Content Validation

```python
def validate_content(content: str) -> tuple[bool, str]:
    """
    Validate note content.

    Returns:
        (True, "") if valid
        (False, error_message) if invalid
    """
    # Trim whitespace (but preserve internal line breaks)
    content = content.strip()

    # Check empty
    if not content:
        return False, "Content cannot be empty. Please enter content (1-5000 characters)."

    # Check length
    if len(content) > 5000:
        return False, f"Content is too long ({len(content)}/5000 characters). Please shorten your content."

    return True, ""
```

### Category Validation

```python
VALID_CATEGORIES = ["personal", "work", "ideas", "other"]

def validate_category(category: str) -> tuple[bool, str]:
    """
    Validate note category.

    Returns:
        (True, category) if valid or empty (returns default)
        (False, error_message) if invalid
    """
    category = category.strip().lower()

    # Empty = use default
    if not category:
        return True, "other"

    # Check valid enum
    if category not in VALID_CATEGORIES:
        return False, f"Invalid category. Must be one of: {', '.join(VALID_CATEGORIES)}."

    return True, category
```

---

## Error Handling

### E1: Empty Title
- **Condition**: User provides empty string or whitespace-only title
- **Message**: "❌ Error: Title cannot be empty. Please enter a title (1-200 characters)."
- **Action**: Re-prompt for title

### E2: Title Too Long
- **Condition**: Title exceeds 200 characters
- **Message**: "❌ Error: Title is too long ({actual}/200 characters). Please shorten your title."
- **Action**: Re-prompt for title

### E3: Empty Content
- **Condition**: User provides empty string or whitespace-only content
- **Message**: "❌ Error: Content cannot be empty. Please enter content (1-5000 characters)."
- **Action**: Re-prompt for content

### E4: Content Too Long
- **Condition**: Content exceeds 5000 characters
- **Message**: "❌ Error: Content is too long ({actual}/5000 characters). Please shorten your content."
- **Action**: Re-prompt for content

### E5: Invalid Category
- **Condition**: Category not in allowed list
- **Message**: "❌ Error: Invalid category. Must be one of: personal, work, ideas, other."
- **Action**: Re-prompt for category

---

## Success Messages

### Standard Success

```
✓ Note created successfully!
  ID: 1
  Title: "My First Note"
  Category: personal
  Created: 2025-12-10 15:30
```

### Long Title (Truncated Display)

```
✓ Note created successfully!
  ID: 2
  Title: "This is a very long note title that will be..."
  Category: work
  Created: 2025-12-10 15:31
```

---

## Implementation Guidance

### CLI Layer (cli.py)

```python
def handle_add_note(manager: NoteManager) -> None:
    """Handle the add note workflow."""
    print("\n=== Add New Note ===\n")

    # Get title
    while True:
        title = input("Enter note title (1-200 characters): ").strip()
        is_valid, error_msg = validate_title(title)
        if is_valid:
            break
        display_error(error_msg)

    # Get content (multi-line)
    print("\nEnter note content (1-5000 characters):")
    print("(Press Ctrl+D on Unix/Mac or Ctrl+Z on Windows when done)\n")
    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass

    content = "\n".join(lines).strip()
    is_valid, error_msg = validate_content(content)
    if not is_valid:
        display_error(error_msg)
        return

    # Get category
    category_input = input("\nEnter category (personal/work/ideas/other) [default: other]: ").strip()
    is_valid, category = validate_category(category_input)
    if not is_valid:
        display_error(category)
        return

    # Create note
    try:
        note = manager.add_note(title, content, category)
        if note:
            display_success(f"Note created successfully!")
            print(f"  ID: {note.id}")
            print(f"  Title: \"{note.title[:50]}{'...' if len(note.title) > 50 else ''}\"")
            print(f"  Category: {note.category}")
            print(f"  Created: {note.created_at.strftime('%Y-%m-%d %H:%M')}")
        else:
            display_error("Failed to create note. Please try again.")
    except ValueError as e:
        display_error(str(e))
```

### Business Logic Layer (note_manager.py)

```python
class NoteManager:
    def __init__(self):
        self._notes: List[Note] = []
        self._next_id: int = 1

    def add_note(self, title: str, content: str, category: str = "other") -> Optional[Note]:
        """
        Add a new note to the list.

        Args:
            title: Note title (1-200 characters)
            content: Note content (1-5000 characters)
            category: Note category (personal|work|ideas|other)

        Returns:
            Created Note object, or None if creation fails

        Raises:
            ValueError: If validation fails
        """
        # Validate inputs
        is_valid, error = validate_title(title)
        if not is_valid:
            raise ValueError(error)

        is_valid, error = validate_content(content)
        if not is_valid:
            raise ValueError(error)

        is_valid, validated_category = validate_category(category)
        if not is_valid:
            raise ValueError(validated_category)

        # Create note
        now = datetime.now()
        note = Note(
            id=self._next_id,
            title=title.strip(),
            content=content.strip(),
            category=validated_category,
            is_archived=False,
            created_at=now,
            updated_at=now
        )

        self._notes.append(note)
        self._next_id += 1

        return note
```

---

## Test Scenarios

### Test 1: Valid Note Creation
**Input**:
- Title: "My First Note"
- Content: "This is the content of my first note."
- Category: "personal"

**Expected**:
- Note created with ID 1
- Title: "My First Note"
- Content: "This is the content of my first note."
- Category: "personal"
- is_archived: false
- created_at and updated_at set to current time
- Success message displayed

### Test 2: Empty Title
**Input**:
- Title: "" (empty string)

**Expected**:
- Error: "❌ Error: Title cannot be empty. Please enter a title (1-200 characters)."
- Re-prompt for title

### Test 3: Title Too Long
**Input**:
- Title: "A" * 201 (201 characters)

**Expected**:
- Error: "❌ Error: Title is too long (201/200 characters). Please shorten your title."
- Re-prompt for title

### Test 4: Empty Content
**Input**:
- Title: "Valid Title"
- Content: "" (empty string)

**Expected**:
- Error: "❌ Error: Content cannot be empty. Please enter content (1-5000 characters)."
- Re-prompt for content

### Test 5: Content Too Long
**Input**:
- Title: "Valid Title"
- Content: "A" * 5001 (5001 characters)

**Expected**:
- Error: "❌ Error: Content is too long (5001/5000 characters). Please shorten your content."
- Re-prompt for content

### Test 6: Invalid Category
**Input**:
- Title: "Valid Title"
- Content: "Valid content"
- Category: "urgent"

**Expected**:
- Error: "❌ Error: Invalid category. Must be one of: personal, work, ideas, other."
- Re-prompt for category

### Test 7: Default Category
**Input**:
- Title: "Valid Title"
- Content: "Valid content"
- Category: "" (empty, use default)

**Expected**:
- Note created with category "other"
- Success message displayed

### Test 8: Multi-line Content
**Input**:
- Title: "Meeting Notes"
- Content: "Line 1\nLine 2\nLine 3"
- Category: "work"

**Expected**:
- Note created with content preserving line breaks
- Content displays correctly when viewed

### Test 9: Special Characters in Title
**Input**:
- Title: "React & Vue: Comparison 🚀"
- Content: "Content here"
- Category: "work"

**Expected**:
- Note created with title including &, :, and emoji
- No XSS or injection issues

### Test 10: Unicode Content
**Input**:
- Title: "مثال" (Arabic)
- Content: "محتوى النص" (Arabic)
- Category: "personal"

**Expected**:
- Note created with unicode title and content
- Displays correctly when viewed

---

## Example Interactions

### Example 1: Successful Note Creation

```
=== Add New Note ===

Enter note title (1-200 characters): My First Note
Enter note content (1-5000 characters):
(Press Ctrl+D on Unix/Mac or Ctrl+Z on Windows when done)

This is the content of my first note.
It can span multiple lines.
^D

Enter category (personal/work/ideas/other) [default: other]: personal

✓ Note created successfully!
  ID: 1
  Title: "My First Note"
  Category: personal
  Created: 2025-12-10 15:30
```

### Example 2: Empty Title Error

```
=== Add New Note ===

Enter note title (1-200 characters):
❌ Error: Title cannot be empty. Please enter a title (1-200 characters).

Enter note title (1-200 characters): My Note
Enter note content (1-5000 characters):
...
```

### Example 3: Invalid Category

```
=== Add New Note ===

Enter note title (1-200 characters): Work Meeting
Enter note content (1-5000 characters):
(Press Ctrl+D on Unix/Mac or Ctrl+Z on Windows when done)

Discussed project timeline and deliverables.
^D

Enter category (personal/work/ideas/other) [default: other]: urgent
❌ Error: Invalid category. Must be one of: personal, work, ideas, other.

Enter category (personal/work/ideas/other) [default: other]: work

✓ Note created successfully!
  ID: 2
  Title: "Work Meeting"
  Category: work
  Created: 2025-12-10 15:32
```

### Example 4: Long Title Truncated

```
=== Add New Note ===

Enter note title (1-200 characters): This is a very long note title that exceeds fifty characters and will be truncated in the success message

Enter note content (1-5000 characters):
(Press Ctrl+D on Unix/Mac or Ctrl+Z on Windows when done)

Content here.
^D

Enter category (personal/work/ideas/other) [default: other]:

✓ Note created successfully!
  ID: 3
  Title: "This is a very long note title that exceeds fift..."
  Category: other
  Created: 2025-12-10 15:35
```

---

## Non-Functional Requirements

### Performance
- Note creation completes in <100ms
- No noticeable lag for user

### Usability
- Clear prompts with character limits shown
- Helpful error messages with specific guidance
- Multi-line content input supported
- Default category for quick entry

### Security
- Input sanitization prevents injection
- No code execution from user input
- Safe storage of special characters

### Maintainability
- Validation logic separate from UI
- Easy to add new categories
- Easy to adjust character limits

---

**Generated by**: CRUD Spec Generator Skill v1.0.0
**Template**: Phase I Task Specification Pattern
**Bonus Feature**: Reusable Intelligence (+200 points)
