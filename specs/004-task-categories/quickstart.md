# Quickstart Guide: Task Categories System

**Feature**: 004-task-categories
**Date**: 2025-12-24
**Purpose**: Quick reference for implementing and testing the task categories feature

## Prerequisites

- ✅ Feature 003-task-crud completed and working
- ✅ Backend running (FastAPI on port 8000)
- ✅ Frontend running (Next.js on port 3000)
- ✅ User authentication working (Better Auth with JWT)
- ✅ PostgreSQL database accessible (Neon)

## Implementation Checklist

### Backend (Python/FastAPI)

- [ ] **1. Create Category Model** (`app/models/category.py`)
  - SQLModel class with fields: id, name, color, user_id, timestamps
  - Validation: name (1-50 chars), color (hex pattern)
  - Unique constraint on (user_id, name)

- [ ] **2. Update Task Model** (`app/models/task.py`)
  - Add `category_id: Optional[int]` field
  - Foreign key to categories(id) with ON DELETE SET NULL

- [ ] **3. Create Migrations**
  - `migrations/002_create_categories_table.sql`
  - `migrations/003_add_category_to_tasks.sql`
  - Run migrations against database

- [ ] **4. Create Category Router** (`app/routers/categories.py`)
  - GET /api/categories - List user's categories
  - POST /api/categories - Create category (validate uniqueness)
  - PUT /api/categories/{id} - Update category
  - DELETE /api/categories/{id} - Delete + set tasks to null

- [ ] **5. Update Tasks Router** (`app/routers/tasks.py`)
  - Add `category_id` query parameter to GET endpoint
  - Add `category_id` field to TaskCreate schema
  - Add `category_id` field to TaskUpdate schema
  - Validate category ownership on assignment

- [ ] **6. Register Router** (`app/main.py`)
  - `app.include_router(categories_router)`

### Frontend (TypeScript/React)

- [ ] **7. Create Category Types** (`types/category.ts`)
  - Category, CategoryCreate, CategoryUpdate interfaces

- [ ] **8. Update Task Types** (`types/task.ts`)
  - Add `category_id: number | null` to Task interface
  - Add to TaskCreate and TaskUpdate

- [ ] **9. Update API Client** (`lib/api.ts`)
  - `getCategories()` - GET /api/categories
  - `createCategory(data)` - POST /api/categories
  - `updateCategory(id, data)` - PUT /api/categories/{id}
  - `deleteCategory(id)` - DELETE /api/categories/{id}
  - Update `getTasks({ category_id? })` with filter parameter

- [ ] **10. Create CategoryManager Component** (`components/CategoryManager.tsx`)
  - List categories with colors
  - Create category form (name + color picker)
  - Edit category (rename, change color)
  - Delete category (with confirmation)

- [ ] **11. Update TaskForm Component** (`components/TaskForm.tsx`)
  - Add category dropdown selector
  - Load categories on mount
  - Include category_id in create/update payload

- [ ] **12. Update TaskList Component** (`components/TaskList.tsx`)
  - Add category filter dropdown
  - "All Categories" option
  - Filter tasks when category selected

- [ ] **13. Update TaskItem Component** (`components/TaskItem.tsx`)
  - Display category badge with color
  - Show "Uncategorized" if no category

## Quick Test Scenarios

### Test 1: Category CRUD
```bash
# User: testuser@example.com
# Expected: Complete category lifecycle

1. Create category "Work" with blue color (#3B82F6)
   → Should appear in category list
2. Create category "Personal" with green color (#10B981)
   → Should appear in category list
3. Try to create duplicate "Work"
   → Should show error "Category name already exists"
4. Rename "Work" to "Office"
   → Should update successfully, tasks show "Office"
5. Delete "Personal" category
   → Category removed, tasks become uncategorized
```

### Test 2: Task-Category Assignment
```bash
# Prerequisites: Categories "Work", "Shopping" exist
# Expected: Tasks correctly assigned and displayed

1. Create task "Prepare presentation" in "Work" category
   → Task shows Work badge with blue color
2. Create task "Buy groceries" without category
   → Task shows "Uncategorized"
3. Edit "Buy groceries", assign to "Shopping"
   → Task now shows Shopping badge
4. Edit task, remove category (set to null)
   → Task becomes uncategorized again
```

### Test 3: Category Filtering
```bash
# Prerequisites: 5 tasks (3 Work, 1 Shopping, 1 Uncategorized)
# Expected: Filtering works correctly

1. No filter applied
   → Shows all 5 tasks
2. Filter by "Work"
   → Shows only 3 work tasks
3. Filter by "Shopping"
   → Shows only 1 shopping task
4. Filter by empty category
   → Shows only uncategorized task (if supported)
5. Clear filter
   → Shows all 5 tasks again
```

### Test 4: User Isolation
```bash
# Users: alice@example.com, bob@example.com
# Expected: Complete isolation between users

1. Alice creates category "Work"
2. Bob creates category "Work"
   → Both succeed (unique per user, not global)
3. Alice creates task in her "Work" category
4. Bob filters by his "Work" category
   → Bob sees only his tasks, not Alice's
5. Bob tries to assign task to Alice's category ID
   → Should fail validation
```

### Test 5: Category Deletion Preserves Tasks
```bash
# Prerequisites: Category "Temp" with 3 tasks
# Expected: Tasks survive category deletion

1. Verify 3 tasks in "Temp" category
2. Delete "Temp" category
   → Success message shown
3. Check tasks that were in "Temp"
   → All 3 tasks still exist
   → All 3 tasks now show "Uncategorized"
   → category_id = null in database
```

## Manual Testing Commands

### Backend API Testing (curl)

```bash
# Set authentication token
export TOKEN="your-jwt-token-here"

# 1. List categories
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/categories

# 2. Create category
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Work","color":"#3B82F6"}' \
  http://localhost:8000/api/categories

# 3. Update category
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Office","color":"#6366F1"}' \
  http://localhost:8000/api/categories/1

# 4. Delete category
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/categories/1

# 5. List tasks (filtered by category)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/tasks?category_id=2"

# 6. Create task with category
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Prepare slides","category_id":1}' \
  http://localhost:8000/api/tasks
```

### Database Verification

```sql
-- Check categories table
SELECT * FROM categories ORDER BY user_id, name;

-- Check tasks with categories
SELECT t.id, t.title, t.category_id, c.name as category_name
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.user_id, c.name;

-- Verify category uniqueness constraint
SELECT user_id, name, COUNT(*)
FROM categories
GROUP BY user_id, name
HAVING COUNT(*) > 1;

-- Check uncategorized tasks
SELECT id, title, user_id
FROM tasks
WHERE category_id IS NULL;

-- Verify ON DELETE SET NULL works
-- (Delete a category and check tasks)
DELETE FROM categories WHERE id = 1;
SELECT id, title, category_id FROM tasks WHERE category_id IS NULL;
```

## Common Issues & Solutions

### Issue: "Category name already exists" when creating
**Solution**: Each user can only have one category with a given name. Try a different name or rename the existing category.

### Issue: Task not appearing in filtered view
**Solution**: Verify task's category_id matches the filter. Use "All Categories" view to see all tasks.

### Issue: Can't delete category
**Solution**: Ensure you own the category. Check authentication token is valid.

### Issue: Tasks disappear after deleting category
**Solution**: This shouldn't happen. Tasks should become uncategorized (category_id = null). Check database constraint is ON DELETE SET NULL, not CASCADE.

### Issue: Category color not displaying
**Solution**: Verify color is valid hex code (#RRGGBB). Check frontend CSS applies the color correctly.

### Issue: User sees another user's categories
**Solution**: Critical bug. Verify user_id filtering in GET /api/categories endpoint. Check authentication middleware.

## Performance Validation

### Expected Performance (per Success Criteria)

1. **Category Creation**: < 5 seconds
   ```bash
   time curl -X POST ... /api/categories
   # Should complete in < 5s
   ```

2. **Category Filtering**: < 1 second
   ```bash
   time curl ".../api/tasks?category_id=1"
   # Should complete in < 1s
   ```

3. **Multiple Categories**: Test with 50+ categories
   ```bash
   # Create 50 categories
   for i in {1..50}; do
     curl -X POST -d "{\"name\":\"Category$i\"}" /api/categories
   done
   # List should still be fast
   time curl /api/categories
   ```

4. **Rename Updates**: < 1 second
   ```bash
   time curl -X PUT -d '{"name":"New Name"}' /api/categories/1
   # Should complete in < 1s
   ```

## Integration Points

### Connects To
- **Feature 003-task-crud**: Extends task model and API
- **Better Auth**: Uses JWT for user identification
- **Neon PostgreSQL**: Stores categories and relationships

### Future Extensions
- **Dashboard** (future): Can show task counts per category
- **Analytics** (future): Category-based productivity metrics
- **Kanban Board** (future): Organize columns by category

## Deployment Checklist

- [ ] Run migrations on production database
- [ ] Verify indexes created (idx_categories_user, idx_tasks_category)
- [ ] Test user isolation with production data
- [ ] Verify category deletion doesn't delete tasks
- [ ] Monitor query performance with real data
- [ ] Check color validation works correctly
- [ ] Verify unique constraint prevents duplicates

## Success Criteria Validation

✅ **SC-001**: Category creation < 5 seconds
✅ **SC-002**: 100% task assignment accuracy
✅ **SC-003**: Filtering < 1 second
✅ **SC-004**: Rename updates instantly
✅ **SC-005**: 0% data loss on category delete
✅ **SC-006**: 100% user isolation
✅ **SC-007**: 50+ categories supported
✅ **SC-008**: 95% of operations < 2 seconds

All criteria must pass before considering feature complete.
