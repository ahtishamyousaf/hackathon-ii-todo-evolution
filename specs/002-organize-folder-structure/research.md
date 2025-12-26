# Research: Folder Structure Reorganization

**Feature**: 002-organize-folder-structure
**Date**: 2025-12-23
**Purpose**: Resolve unknowns and establish best practices for safe file reorganization

## 1. Git History Preservation

**Research Question**: Best practices for `git mv` vs manual move + `git add`?

**Decision**: **Use `git mv` exclusively**

**Rationale**:
- `git mv` automatically stages both the deletion and addition in a single atomic operation
- Git recognizes file moves and preserves full history when using `git log --follow`
- Manual move + add risks losing history if similarity threshold not met
- `git mv` is safer and more explicit about intent

**Command Syntax**:
```bash
# Single file
git mv source/path/file.py destination/path/file.py

# Directory (contents move, not directory itself)
git mv source/dir destination/parent/

# Verification
git log --follow destination/path/file.py  # Shows full history
git status  # Shows "renamed: old -> new"
```

**Commit Strategy Decision**: **Single atomic commit for all moves**

**Rationale**:
- Easier rollback if issues discovered
- Atomic operation ensures consistency
- Single commit message documents all changes
- Build verification happens once after all moves

**Alternatives Considered**:
- Multiple commits (one per category): Rejected - creates unnecessary noise, complicates rollback
- Manual move + `git add`: Rejected - risks history loss
- `mv` then `git add -A`: Rejected - git may not recognize as rename

## 2. Next.js Route Group Migration

**Research Question**: Moving pages between route groups in App Router - does it break routes?

**Decision**: **Routes automatically update, but verify OAuth callback configuration**

**Findings**:
- Next.js App Router derives routes from file paths automatically
- Moving `/app/forgot-password/page.tsx` to `/app/(auth)/forgot-password/page.tsx` changes route from `/forgot-password` to `/forgot-password` (route groups in parentheses are ignored in URL)
- OAuth callback URL considerations:
  - Better Auth callback handler at `/app/auth/callback/page.tsx`
  - Moving to `/app/(auth)/callback/page.tsx` keeps URL as `/callback`
  - **Risk**: If OAuth provider configured with full URL, verify redirect_uri still matches

**Migration Checklist**:
- [x] Understand that `(auth)` route group is not part of URL path
- [x] Verify `/forgot-password` → `/forgot-password` (no change)
- [x] Verify `/reset-password` → `/reset-password` (no change)
- [x] Verify `/auth/callback` → `/callback` (URL changes - check OAuth config)
- [x] Test auth flow after migration
- [x] Check for hardcoded auth paths in redirects

**Alternatives Considered**:
- Keep auth routes scattered: Rejected - violates Next.js conventions and constitution
- Use `/auth/` instead of `/(auth)/`: Rejected - route group pattern is cleaner, hides implementation detail

## 3. Import Path Update Strategy

**Research Question**: Tools for bulk import path updates?

**Decision**: **Manual search and update with TypeScript compiler verification**

**Rationale**:
- Migration files: No imports (Python scripts executed independently)
- Auth pages: Internal Next.js routing, no import path changes needed
- Documentation: Markdown files, no code imports
- Components (TaskList): TypeScript compiler will catch broken imports
- Scope is small (~5-10 potential import statements to check)

**Strategy**:
1. Use `grep -r "forgot-password" phase-2-web/frontend/` to find references
2. Use `grep -r "reset-password" phase-2-web/frontend/` to find references
3. Use `grep -r "TaskList" phase-2-web/frontend/` to find component usage
4. Manually update any import statements found
5. Run `npm run build` - TypeScript compiler will error on broken imports
6. Fix any remaining issues identified by compiler

**Verification**:
```bash
cd phase-2-web/frontend
npm run build
# Exit code 0 = success, no broken imports
# Exit code 1 = compilation errors, check output for import issues
```

**Alternatives Considered**:
- Automated tool (jscodeshift, ts-morph): Overkill for <10 import updates
- sed find-replace: Too error-prone, doesn't handle all cases
- IDE refactoring: Not available in CLI workflow

## 4. Migration File Organization

**Research Question**: Database migration folder naming conventions?

**Decision**: **Keep existing filenames, add README.md for execution order**

**Best Practice** (FastAPI/SQLAlchemy/Alembic):
- Migrations organized in dedicated directory: `/backend/app/migrations/` or `/backend/migrations/`
- Naming: `{number}_{descriptive_name}.py` or `{timestamp}_{description}.py`
- Current files use descriptive names: `add_attachments_migration.py`

**Our Files** (all following same pattern):
```
add_attachments_migration.py
add_categories_migration.py
add_comments_migration.py
add_due_date_migration.py
add_oauth_migration.py
add_password_reset_migration.py
add_priority_column.sql
add_priority_migration.py
add_recurring_tasks_migration.py
add_subtasks_migration.py
```

**Recommended Action**:
- **Do NOT rename** - preserve existing filenames
- **Create README.md** in migrations directory documenting:
  - Execution order (if order matters)
  - Purpose of each migration
  - How to run migrations

**Sample README.md**:
```markdown
# Database Migrations

## Execution Order

Migrations should be run in this order:
1. add_categories_migration.py (base data)
2. add_due_date_migration.py (task enhancements)
3. add_priority_migration.py (task enhancements)
4. add_priority_column.sql (schema change)
5. add_subtasks_migration.py (task relationships)
6. add_comments_migration.py (task interactions)
7. add_attachments_migration.py (task attachments)
8. add_recurring_tasks_migration.py (advanced features)
9. add_oauth_migration.py (auth enhancements)
10. add_password_reset_migration.py (auth enhancements)

## Running Migrations

```bash
python -m app.migrations.add_categories_migration
# ... (each migration)
```
```

**Alternatives Considered**:
- Rename with numeric prefixes (001_, 002_, etc.): Rejected - loses semantic meaning, requires more changes
- Use Alembic migration tool: Out of scope for this feature, future enhancement

## 5. Component Deprecation Pattern

**Research Question**: How to handle TaskList.tsx vs TasksList.tsx conflict?

**Decision**: **Keep TasksList.tsx (canonical), rename TaskList.tsx to TaskListOld.tsx with deprecation comment**

**Analysis**:
- TasksList.tsx: More feature-complete (has filters, search, pagination)
- TaskList.tsx: Simpler component (basic list)
- Usage: Need to grep codebase to find which is used where

**Strategy**:
```bash
# Find usages
grep -r "TaskList" phase-2-web/frontend/components/
grep -r "TaskList" phase-2-web/frontend/app/
grep -r "from.*TaskList" phase-2-web/frontend/

# If TaskList.tsx is imported anywhere:
# 1. Update imports to TasksList
# 2. Rename TaskList.tsx → TaskListOld.tsx
# 3. Add deprecation comment:

/**
 * @deprecated Use TasksList.tsx instead
 * This component is kept for reference only
 * TODO: Remove after confirming no usages remain
 */
```

**Verification**:
- TypeScript build must pass
- No import errors for "TaskList"
- Search codebase for any remaining references

**Alternatives Considered**:
- Delete TaskList.tsx immediately: Risky - might be used somewhere
- Keep both: Confusing - violates clean code principle
- Merge into one: Out of scope - this is organization, not refactoring

## Summary of Decisions

| Research Item | Decision | Risk Level |
|---------------|----------|------------|
| Git history preservation | Use `git mv` exclusively, single commit | Low |
| Next.js route migration | Routes auto-update, verify OAuth callback | Medium |
| Import updates | Manual search + TypeScript verification | Low |
| Migration naming | Keep existing names, add README.md | Low |
| Component conflict | Keep TasksList, rename TaskList to TaskListOld | Low |

**All research items resolved** - Ready to proceed to Phase 1 (Design & Contracts)
