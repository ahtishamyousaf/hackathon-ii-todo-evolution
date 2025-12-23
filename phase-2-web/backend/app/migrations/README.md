# Database Migrations

## Purpose

This directory contains all database migration files for the Todo Web App Phase II project.

## Migration Files

1. `add_categories_migration.py` - Base category data
2. `add_due_date_migration.py` - Task due date support
3. `add_priority_migration.py` - Task priority levels
4. `add_priority_column.sql` - Priority schema update (SQL)
5. `add_subtasks_migration.py` - Subtask relationships
6. `add_comments_migration.py` - Task comments
7. `add_attachments_migration.py` - File attachments
8. `add_recurring_tasks_migration.py` - Recurring task support
9. `add_oauth_migration.py` - OAuth account linking
10. `add_password_reset_migration.py` - Password reset tokens

## Execution Order

Migrations should be run in the order listed above if running manually. Dependencies:
- Categories before tasks with categories
- Subtasks/comments/attachments depend on tasks existing
- OAuth and password reset are independent auth enhancements

## Running Migrations

```bash
# From backend directory
cd phase-2-web/backend

# Run each migration
python -m app.migrations.add_categories_migration
python -m app.migrations.add_due_date_migration
# ... (continue in order)
```

## Notes

- Migrations are designed to be idempotent (safe to run multiple times)
- Always backup database before running migrations in production
- Test migrations on development environment first
- Each migration creates/modifies specific tables or columns

## Migration History

- **2025-12-23**: Organized migrations into dedicated directory (feature 002-organize-folder-structure)
