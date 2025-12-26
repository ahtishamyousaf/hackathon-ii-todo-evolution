# Feature Specification: Task Categories System

**Feature Branch**: `004-task-categories`
**Created**: 2025-12-24
**Status**: Draft
**Input**: User description: "Task Categories System - Allow users to organize tasks into categories. Users should be able to create custom categories (like "Work", "Personal", "Shopping"), assign tasks to categories, filter tasks by category, and manage (create, rename, delete) their categories. Each category has a name and optional color for visual distinction. Categories are user-specific (each user has their own categories). When viewing tasks, users can filter to show only tasks in a specific category or view all tasks. Include endpoints: GET /api/categories (list all), POST /api/categories (create), PUT /api/categories/{id} (update), DELETE /api/categories/{id} (delete). Tasks should have optional category_id field (nullable, defaults to null for uncategorized tasks). Deleting a category should NOT delete tasks - just set their category_id to null."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Custom Category (Priority: P1)

As a user, I want to create custom categories with names and colors so that I can organize my tasks into meaningful groups.

**Why this priority**: Category creation is the foundational capability - without the ability to create categories, the entire feature is useless. This is the entry point for task organization.

**Independent Test**: Can be fully tested by authenticating a user, creating a category named "Work" with a blue color, and verifying the category appears in the user's category list with correct name and color.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user, **When** I create a category named "Work" with a blue color, **Then** the system creates the category and displays it in my category list
2. **Given** I am a logged-in user, **When** I create a category named "Personal" without specifying a color, **Then** the system creates the category with a default color
3. **Given** I am a logged-in user, **When** I try to create a category with an empty name, **Then** the system shows an error message "Category name is required"
4. **Given** I have a category named "Shopping", **When** I try to create another category with the exact same name "Shopping", **Then** the system shows an error message "Category name already exists"

---

### User Story 2 - Assign Tasks to Categories (Priority: P1)

As a user, I want to assign my tasks to categories so that I can organize related tasks together and find them easily.

**Why this priority**: Without the ability to assign tasks to categories, creating categories has no practical value. This makes the organizational system functional.

**Independent Test**: Can be fully tested by creating a "Work" category, creating a task "Prepare presentation", assigning it to the "Work" category, and verifying the task shows its category association.

**Acceptance Scenarios**:

1. **Given** I have a task "Prepare presentation" and a category "Work", **When** I assign the task to "Work" category, **Then** the task displays the "Work" category label
2. **Given** I have an uncategorized task "Buy groceries", **When** I assign it to "Personal" category, **Then** the task moves from uncategorized to "Personal" category
3. **Given** I have a task assigned to "Work" category, **When** I change its category to "Urgent", **Then** the task displays "Urgent" instead of "Work"
4. **Given** I am creating a new task, **When** I select a category during creation, **Then** the task is created with that category already assigned

---

### User Story 3 - Filter Tasks by Category (Priority: P2)

As a user, I want to filter my task list to show only tasks in a specific category so that I can focus on one area of my life at a time.

**Why this priority**: Filtering is what makes categories truly useful for productivity, but users can still benefit from categorization even without filtering by visually seeing category labels on tasks.

**Independent Test**: Can be fully tested by creating 3 tasks (2 in "Work" category, 1 in "Personal"), applying a filter for "Work" category, and verifying only the 2 work tasks appear.

**Acceptance Scenarios**:

1. **Given** I have 5 tasks with 3 in "Work" category and 2 in "Personal", **When** I filter by "Work" category, **Then** I see only the 3 work tasks
2. **Given** I have applied a category filter, **When** I select "All Categories" or clear the filter, **Then** I see all my tasks regardless of category
3. **Given** I have no tasks in "Shopping" category, **When** I filter by "Shopping", **Then** I see an empty state message "No tasks in this category"
4. **Given** I am viewing a filtered list, **When** I create a new task, **Then** the new task allows me to select any category including the currently filtered one

---

### User Story 4 - Update Category Details (Priority: P2)

As a user, I want to rename categories and change their colors so that I can keep my organization system current as my needs evolve.

**Why this priority**: Category management is important for maintaining a useful system over time, but users can work effectively even if they can't rename categories by creating new ones instead.

**Independent Test**: Can be fully tested by creating a "Work" category with blue color, renaming it to "Office" and changing color to green, and verifying all tasks previously in "Work" now show "Office" with green color.

**Acceptance Scenarios**:

1. **Given** I have a category "Work", **When** I rename it to "Office", **Then** the category name updates and all tasks in that category reflect the new name
2. **Given** I have a category with blue color, **When** I change the color to green, **Then** the category displays with the new green color throughout the interface
3. **Given** I try to rename "Work" to "Personal", **When** "Personal" category already exists, **Then** the system shows error "Category name already exists"
4. **Given** I have a category, **When** I update it with an empty name, **Then** the system prevents the update and shows "Category name is required"

---

### User Story 5 - Delete Unused Categories (Priority: P3)

As a user, I want to delete categories I no longer need so that my category list stays clean and relevant.

**Why this priority**: Deletion is useful for cleanup but not essential. Users can ignore unused categories without significant impact on their workflow.

**Independent Test**: Can be fully tested by creating a "Temporary" category, assigning 2 tasks to it, deleting the category, and verifying the category is gone but the 2 tasks remain as uncategorized.

**Acceptance Scenarios**:

1. **Given** I have a category "Old Project" with 3 tasks, **When** I delete the category, **Then** the category is removed and the 3 tasks become uncategorized
2. **Given** I have a category "Shopping" with no tasks, **When** I delete it, **Then** the category is permanently removed from my category list
3. **Given** I am viewing tasks filtered by "Work" category, **When** I delete the "Work" category, **Then** the filter is cleared and I see all uncategorized tasks
4. **Given** I try to delete a category, **When** I confirm the deletion, **Then** the system shows a success message "Category deleted successfully"

---

### Edge Cases

- What happens when a user has tasks in a category and deletes that category? Tasks must become uncategorized (category_id set to null), not deleted.
- How does the system handle duplicate category names? System must enforce unique category names per user.
- What happens if a user tries to access another user's categories? System must enforce user isolation and return only the authenticated user's categories.
- How does the system handle very long category names? System should validate maximum length (50 characters recommended).
- What happens if a user creates many categories (100+)? System should handle large numbers efficiently but may consider a soft limit with warning.
- How are colors represented? Use standard web color codes (hex format like #FF5733) or predefined color palette.
- What is the default color if none specified? Use a neutral color like gray (#9CA3AF).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create categories with a unique name (1-50 characters) and optional color
- **FR-002**: System MUST enforce category name uniqueness per user (case-sensitive)
- **FR-003**: System MUST apply a default color (gray #9CA3AF) when no color is specified
- **FR-004**: System MUST allow users to assign tasks to categories or leave them uncategorized
- **FR-005**: System MUST allow users to change a task's category at any time (including during creation and editing)
- **FR-006**: System MUST allow users to filter task lists to show only tasks in a specific category
- **FR-007**: System MUST provide an "All Categories" filter option to show all tasks
- **FR-008**: System MUST allow users to rename existing categories while enforcing uniqueness
- **FR-009**: System MUST allow users to change category colors
- **FR-010**: System MUST allow users to delete categories
- **FR-011**: System MUST set category_id to null for all tasks when their category is deleted (preserve tasks)
- **FR-012**: System MUST enforce user isolation (users only see their own categories)
- **FR-013**: System MUST validate category name length (maximum 50 characters)
- **FR-014**: System MUST validate color format if provided (valid hex code or null)
- **FR-015**: System MUST persist category filter state during active session

### Key Entities

- **Category**: Represents a user-defined organizational group
  - name: Category name (1-50 characters, unique per user)
  - color: Visual identifier (hex color code, optional)
  - user_id: Owner of the category
  - created_at: Timestamp of creation
  - updated_at: Timestamp of last modification
  - Relationships: Belongs to one user, has many tasks

- **Task** (Modified): Existing task entity with added category relationship
  - category_id: Optional foreign key to category (null = uncategorized)
  - Relationships: Belongs to zero or one category

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new category in under 5 seconds
- **SC-002**: Users can organize tasks into categories with 100% accuracy (no task assigned to wrong category)
- **SC-003**: Category filtering reduces visible tasks by expected amount instantly (under 1 second)
- **SC-004**: Renaming a category updates all task labels within 1 second
- **SC-005**: Deleting a category preserves all associated tasks (0% data loss)
- **SC-006**: Multiple users can independently manage categories without seeing each other's categories (100% user isolation)
- **SC-007**: System handles at least 50 categories per user without performance degradation
- **SC-008**: Category operations complete within 2 seconds for 95% of requests

## Assumptions

1. **Color Representation**: Using hex color codes (e.g., #FF5733) for simplicity. Alternative predefined color palette can be added later if needed.

2. **Default Color**: Gray (#9CA3AF) used as default when no color specified, ensuring visual consistency.

3. **Category Limit**: No hard limit on number of categories per user, but UI/UX optimized for typical use (10-20 categories).

4. **Filter Persistence**: Category filter state persists during active session but resets on page reload (no persistent filter preference in MVP).

5. **Category Deletion Behavior**: Deleting a category uncategorizes tasks rather than deleting them, preserving user data integrity.

6. **Unique Names**: Category names are case-sensitive and must be exactly unique (e.g., "Work" and "work" are different).

7. **Task Assignment**: Creating a task while viewing a filtered category list does NOT automatically assign the task to that category unless explicitly selected.

8. **API Design**: RESTful API design with standard HTTP methods (GET, POST, PUT, DELETE) for category operations.

## Dependencies

- **Task Management System** (Feature 003-task-crud): Categories extend the existing task system, requiring tasks table to support category_id field
- **User Authentication**: Requires authenticated user context to enforce user isolation
- **Database**: Requires categories table creation and tasks table migration to add category_id column

## Out of Scope

- Category sharing between users
- Category hierarchies or nested categories (subcategories)
- Category-based permissions or access control
- Category templates or presets
- Automatic category suggestions based on task content
- Category-based task sorting (separate from filtering)
- Category archives (soft delete)
- Category statistics in this feature (may be shown in separate dashboard feature)
- Drag-and-drop category organization
- Category import/export

## Acceptance Criteria Summary

**The feature is considered complete when**:

1. Users can create, view, update, and delete categories
2. Users can assign tasks to categories or leave them uncategorized
3. Users can filter task lists by category
4. All category operations enforce user isolation (users only see their own categories)
5. Deleting a category preserves all associated tasks (uncategorizes them)
6. Category names are validated for uniqueness per user
7. All API endpoints (GET, POST, PUT, DELETE) are implemented and tested
8. Frontend UI displays categories with correct colors
9. All user stories have passing acceptance tests
10. System handles at least 50 categories per user without performance issues
