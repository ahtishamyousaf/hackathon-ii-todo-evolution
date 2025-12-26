# Folder Organization Execution Guide

**Feature**: 002-organize-folder-structure
**Purpose**: Step-by-step guide for implementing folder structure reorganization
**Date**: 2025-12-23

## Prerequisites

Before starting, ensure:
- [x] You are on branch `002-organize-folder-structure`
- [x] Working directory is clean (no uncommitted changes)
- [x] All existing tests pass
- [x] You have reviewed `research.md` and `plan.md`
- [x] Frontend builds successfully (`cd phase-2-web/frontend && npm run build`)

**Backup Plan**: All changes will be in a single commit, so `git revert` can undo everything if needed.

## Execution Steps

### Step 1: Create New Directories

```bash
# From project root
mkdir -p phase-2-web/backend/app/migrations
mkdir -p phase-2-web/docs
mkdir -p docs/hackathon  # Optional: for large spec file

echo "✅ Directories created"
```

**Verification**:
```bash
ls -ld phase-2-web/backend/app/migrations
ls -ld phase-2-web/docs
# Both should show as new directories
```

### Step 2: Move Migration Files (Preserve History)

```bash
# Move all 10 migration files using git mv
git mv phase-2-web/backend/add_attachments_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_categories_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_comments_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_due_date_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_oauth_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_password_reset_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_priority_column.sql phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_priority_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_recurring_tasks_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_subtasks_migration.py phase-2-web/backend/app/migrations/

echo "✅ Migration files moved"
```

**Verification**:
```bash
# Should show 10 files
ls -1 phase-2-web/backend/app/migrations/

# Should show 0 migration files
ls -1 phase-2-web/backend/*.py | grep -i migration || echo "None found (correct)"

# Check git recognizes as rename (not delete + add)
git status | grep "renamed:"
```

### Step 3: Move Documentation

```bash
# Move Better Auth documentation
git mv phase-2-web/frontend/BETTER_AUTH_SETUP.md phase-2-web/docs/
git mv phase-2-web/frontend/BETTER_AUTH_QUICK_REFERENCE.md phase-2-web/docs/

echo "✅ Documentation moved"
```

**Verification**:
```bash
ls -1 phase-2-web/docs/
# Should show both .md files

ls -1 phase-2-web/frontend/BETTER_AUTH*.md 2>/dev/null || echo "None found (correct)"
```

### Step 4: Consolidate Auth Routes

**IMPORTANT**: This changes OAuth callback URL from `/auth/callback` to `/callback`

```bash
# Move forgot-password and reset-password to (auth)/ route group
git mv phase-2-web/frontend/app/forgot-password phase-2-web/frontend/app/\(auth\)/
git mv phase-2-web/frontend/app/reset-password phase-2-web/frontend/app/\(auth\)/

# Move OAuth callback from /auth/ to (auth)/
git mv phase-2-web/frontend/app/auth/callback phase-2-web/frontend/app/\(auth\)/

# Remove now-empty auth directory
rmdir phase-2-web/frontend/app/auth

echo "✅ Auth routes consolidated"
```

**Verification**:
```bash
# Should show 5 directories: login, register, callback, forgot-password, reset-password
ls -1d phase-2-web/frontend/app/\(auth\)/*/

# Should NOT exist
ls -1d phase-2-web/frontend/app/auth 2>/dev/null && echo "ERROR: auth/ still exists" || echo "Correct: auth/ removed"
ls -1d phase-2-web/frontend/app/forgot-password 2>/dev/null && echo "ERROR: forgot-password at root" || echo "Correct"
ls -1d phase-2-web/frontend/app/reset-password 2>/dev/null && echo "ERROR: reset-password at root" || echo "Correct"
```

**CRITICAL**: Test OAuth callback URL:
- Better Auth should now use `/callback` instead of `/auth/callback`
- Verify Better Auth configuration in `lib/auth.ts`
- Test login flow after changes

### Step 5: Handle Component Naming (TaskList vs TasksList)

**First, find all usages**:
```bash
echo "Searching for TaskList imports..."
grep -r "from.*TaskList" phase-2-web/frontend/ --include="*.tsx" --include="*.ts"
grep -r "import.*TaskList" phase-2-web/frontend/ --include="*.tsx" --include="*.ts"
```

**If TaskList.tsx is used** (update imports first):
```bash
# Example: Update import in a file
# sed -i "s/from '.*\/TaskList'/from '..\/TasksList'/g" path/to/file.tsx
# OR manually update files shown in grep results above
```

**Then rename the file**:
```bash
git mv phase-2-web/frontend/components/TaskList.tsx phase-2-web/frontend/components/TaskListOld.tsx

echo "✅ Component renamed to TaskListOld.tsx"
```

**Add deprecation comment**:
```typescript
// Edit TaskListOld.tsx and add at the top:
/**
 * @deprecated Use TasksList.tsx instead
 * This component is kept for reference only
 * TODO: Remove after confirming no usages remain
 */
```

### Step 6: Update .gitignore

```bash
# Append exclusion patterns
cat >> .gitignore << 'EOF'

# Log files
*.log
backend.log

# OS artifacts
*:Zone.Identifier
.DS_Store
EOF

echo "✅ .gitignore updated"
```

**Verification**:
```bash
grep "\.log" .gitignore
grep "Zone\.Identifier" .gitignore
# Both should show matches
```

### Step 7: Create Migration README (Optional but Recommended)

```bash
cat > phase-2-web/backend/app/migrations/README.md << 'EOF'
# Database Migrations

## Execution Order

Migrations should be run in this order:

1. `add_categories_migration.py` - Base category data
2. `add_due_date_migration.py` - Task due date support
3. `add_priority_migration.py` - Task priority levels
4. `add_priority_column.sql` - Priority schema update
5. `add_subtasks_migration.py` - Subtask relationships
6. `add_comments_migration.py` - Task comments
7. `add_attachments_migration.py` - File attachments
8. `add_recurring_tasks_migration.py` - Recurring task support
9. `add_oauth_migration.py` - OAuth account linking
10. `add_password_reset_migration.py` - Password reset tokens

## Running Migrations

```bash
# From backend directory
python -m app.migrations.add_categories_migration
# ... (repeat for each migration in order)
```

## Notes

- Migrations are idempotent (safe to run multiple times)
- Order matters for migrations with foreign key dependencies
- Always backup database before running migrations in production
EOF

git add phase-2-web/backend/app/migrations/README.md
echo "✅ Migration README created"
```

### Step 8: Verify Build (CRITICAL)

```bash
echo "Building frontend to check for broken imports..."
cd phase-2-web/frontend
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Frontend build PASSED"
else
  echo "❌ Frontend build FAILED - check errors above"
  echo "Fix import errors before proceeding to commit"
  exit 1
fi

cd - > /dev/null
```

**If build fails**:
1. Check error messages for import issues
2. Use `grep -r "OldImportPath" phase-2-web/frontend/` to find problematic imports
3. Update imports
4. Re-run `npm run build`
5. Repeat until build succeeds

### Step 9: Run Full Verification Script

```bash
bash specs/002-organize-folder-structure/contracts/verification.sh
```

**Expected output**: All checks should show ✅ PASS

**If verification fails**:
1. Review error messages
2. Fix issues
3. Re-run verification
4. Do NOT proceed to commit until all checks pass

### Step 10: Move Large Spec File (Optional)

```bash
# Optional: Move the large hackathon spec from root
git mv "Hackathon II - Todo Spec-Driven Development.md" docs/hackathon/

echo "✅ Large spec file organized"
```

### Step 11: Review Changes

```bash
# See all staged changes
git status

# Review file moves
git diff --cached --stat

# Ensure all operations are "renamed:" not "deleted:" + "new file:"
git diff --cached --name-status | grep "^R"
```

**Expected**:
- ~20 files showing as "renamed:" (R)
- 1-2 files showing as "modified:" (M) - .gitignore, possibly README
- 0 files showing as "deleted:" (D) unless intentional
- 2-3 directories created

### Step 12: Commit Everything

```bash
# Stage any remaining changes (.gitignore, README.md)
git add .gitignore
git add phase-2-web/backend/app/migrations/README.md

# Create comprehensive commit
git commit -m "feat: organize project folder structure per constitution

- Move 10 migration files to backend/app/migrations/
- Consolidate auth routes under (auth)/ route group
  - Moved forgot-password, reset-password, callback to (auth)/
  - Removed duplicate /app/auth/ directory
  - OAuth callback URL now /callback (was /auth/callback)
- Centralize documentation in /docs/
  - Moved BETTER_AUTH_SETUP.md
  - Moved BETTER_AUTH_QUICK_REFERENCE.md
- Update .gitignore to exclude log files and OS artifacts
- Clarify component naming (TaskList → TaskListOld, keep TasksList)
- Add migration execution order documentation

Fixes FR-001, FR-002, FR-003, FR-004, FR-005 from spec.md
Resolves constitution violations SC-001 through SC-006
All verifications passing

BREAKING CHANGE: OAuth callback URL changed from /auth/callback to /callback

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✅ Changes committed"
```

### Step 13: Verify Commit

```bash
# Check commit was successful
git log -1 --stat

# Verify git preserved history for moved files
git log --follow --oneline phase-2-web/backend/app/migrations/add_categories_migration.py

# Should show history from before the move
```

### Step 14: Test OAuth Flow (Manual)

**CRITICAL MANUAL TEST**:
1. Start backend: `cd phase-2-web/backend && uvicorn app.main:app --reload`
2. Start frontend: `cd phase-2-web/frontend && npm run dev`
3. Navigate to http://localhost:3000
4. Click "Login"
5. Test OAuth login flow
6. **Verify callback URL works** (should redirect to `/callback` then dashboard)
7. If callback fails, check Better Auth configuration

## Rollback Plan

If anything goes wrong:

```bash
# Undo the commit (keeps files)
git reset --soft HEAD~1

# OR completely revert all changes
git reset --hard HEAD~1

# Restore original state
git checkout .
```

## Success Criteria Checklist

After completing all steps:

- [ ] ✅ SC-001: Zero migration files in backend root
- [ ] ✅ SC-002: All auth pages under (auth)/ route structure
- [ ] ✅ SC-003: All documentation in /docs/
- [ ] ✅ SC-004: Constitution validation passes
- [ ] ✅ SC-005: .gitignore excludes log files
- [ ] ✅ SC-006: Frontend build succeeds (exit code 0)
- [ ] ✅ Git history preserved (git log --follow works)
- [ ] ✅ OAuth callback still functions
- [ ] ✅ No broken imports
- [ ] ✅ Verification script passes

## Troubleshooting

### Build Fails with Import Errors

**Problem**: TypeScript can't find modules after file moves

**Solution**:
1. Check error message for file path
2. Search for imports: `grep -r "problematic/path" phase-2-web/frontend/`
3. Update import paths
4. Rebuild

### OAuth Callback Fails

**Problem**: After login, redirect fails or 404 error

**Solution**:
1. Check Better Auth config in `lib/auth.ts`
2. Verify callback route exists at `/app/(auth)/callback/page.tsx`
3. Check OAuth provider redirect_uri settings (if using external provider)
4. Check browser console for errors

### Git Doesn't Recognize as Rename

**Problem**: git status shows "deleted" + "new file" instead of "renamed"

**Solution**:
1. Check similarity: `git diff --cached -M90%`
2. If files are truly renames, git should detect
3. If not detected, files may have been modified significantly
4. Use `git mv` instead of manual moves

### Verification Script Fails

**Problem**: verification.sh reports errors

**Solution**:
1. Read error messages carefully
2. Fix reported issues
3. Re-run verification
4. Do NOT commit until all checks pass

## Next Steps

After successful commit:

1. Push to remote: `git push origin 002-organize-folder-structure`
2. Create pull request to main branch
3. Request code review
4. Deploy to staging and test
5. Merge after approval

## Files Modified Summary

**Directories Created**: 2
- `phase-2-web/backend/app/migrations/`
- `phase-2-web/docs/`

**Files Moved**: 18
- 10 migration files (backend root → migrations/)
- 2 documentation files (frontend → docs/)
- 3 auth route directories (root → (auth)/)
- 1 OAuth callback (auth/ → (auth)/)
- 1 component (TaskList → TaskListOld)
- 1 large spec file (root → docs/hackathon/) [optional]

**Files Updated**: 2
- `.gitignore` (added patterns)
- `phase-2-web/backend/app/migrations/README.md` (created)

**Files Deleted**: 0 (all moves, no deletions)

**Directories Removed**: 1
- `phase-2-web/frontend/app/auth/` (after moving callback)
