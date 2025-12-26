# Implementation Plan: Organize Project Folder Structure

**Branch**: `002-organize-folder-structure` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-organize-folder-structure/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Reorganize project folder structure to comply with Phase II constitution and fix 10 identified organizational issues. Primary operations: move 10 migration files from backend root to `/backend/app/migrations/`, consolidate auth routes under `/(auth)/` route group, centralize documentation in `/docs/`, resolve component naming conflicts, update .gitignore, and verify all imports after reorganization. This is a **file operations task**, not a code development task - success measured by folder structure compliance and zero broken imports.

## Technical Context

**Language/Version**: N/A (File operations, git commands, shell scripts)
**Primary Dependencies**: Git 2.x (for `git mv` to preserve history), TypeScript compiler (for import verification), npm/Node.js (for build verification)
**Storage**: File system reorganization (no database changes)
**Testing**: Build verification (`npm run build`, TypeScript compilation), manual folder structure inspection
**Target Platform**: WSL2/Linux development environment
**Project Type**: Web (Next.js 16 frontend + FastAPI backend monorepo)
**Performance Goals**: N/A (one-time reorganization operation)
**Constraints**:
- MUST preserve git history using `git mv` not manual move
- MUST NOT break any import statements
- MUST NOT cause TypeScript build errors
- MUST verify frontend build succeeds after all moves
- Changes must be atomic (all-or-nothing via git)
**Scale/Scope**:
- 10 migration files to move
- 5-6 auth route pages to organize
- 2 documentation files to relocate
- ~2 component files (TaskList vs TasksList resolution)
- 1 .gitignore file to update
- Multiple import statements to update across codebase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**From Phase II Constitution v1.1.0**:

✅ **Principle I: Spec-Driven Development** - PASS
- Spec created (spec.md) ✓
- Plan being generated (this file) ✓
- Tasks will be created via sp.tasks ✓
- Implementation via sp.implement ✓

✅ **Principle X: No Manual Coding** - PASS
- No manual coding required (file operations only)
- All operations will be scripted/commanded
- Process documented in plan → tasks → execution

✅ **Project Structure Standards** - **CURRENTLY FAILING** (justification: this feature FIXES these violations)
- Backend migrations scattered in root ✗ → Will fix
- Auth routes inconsistent ✗ → Will fix
- Documentation not centralized ✗ → Will fix
- Component naming ambiguous ✗ → Will fix

✅ **Principle XII: Process Documentation** - PASS
- Spec created with checklist validation ✓
- Plan being documented ✓
- PHRs created for each phase ✓

**Constitution Violations to Fix** (purpose of this feature):
1. FR-001: Migration files must be in `/backend/app/migrations/` - CURRENTLY VIOLATED
2. FR-002: Auth pages must be under `/(auth)/` route group - CURRENTLY VIOLATED
3. FR-003: Documentation must be in `/phase-2-web/docs/` - CURRENTLY VIOLATED
4. FR-005: .gitignore must exclude log files - CURRENTLY VIOLATED

**Post-Implementation Constitution Check**:
After this feature completes, all above violations will be resolved and project structure will be 100% constitution-compliant.

## Project Structure

### Documentation (this feature)

```text
specs/002-organize-folder-structure/
├── spec.md              # Feature specification (DONE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0: Git mv patterns, import strategies (NEXT)
├── data-model.md        # Phase 1: Folder structure design (N/A for file ops)
├── quickstart.md        # Phase 1: Step-by-step execution guide
├── contracts/           # Phase 1: File move manifest, verification tests
│   ├── file-moves.json  # Comprehensive list of all file operations
│   └── verification.sh  # Post-move verification script
├── checklists/
│   └── requirements.md  # Requirements quality checklist (DONE)
└── tasks.md             # Phase 2: Actionable task breakdown (via sp.tasks)
```

### Source Code (repository root)

**Current Structure** (with issues):
```text
hackathon-2/
├── phase-2-web/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── routers/
│   │   │   ├── models/
│   │   │   └── ... (proper structure)
│   │   ├── add_attachments_migration.py        ❌ Should be in migrations/
│   │   ├── add_categories_migration.py          ❌ Should be in migrations/
│   │   ├── add_comments_migration.py            ❌ Should be in migrations/
│   │   ├── add_due_date_migration.py            ❌ Should be in migrations/
│   │   ├── add_oauth_migration.py               ❌ Should be in migrations/
│   │   ├── add_password_reset_migration.py      ❌ Should be in migrations/
│   │   ├── add_priority_column.sql              ❌ Should be in migrations/
│   │   ├── add_priority_migration.py            ❌ Should be in migrations/
│   │   ├── add_recurring_tasks_migration.py     ❌ Should be in migrations/
│   │   └── add_subtasks_migration.py            ❌ Should be in migrations/
│   └── frontend/
│       ├── app/
│       │   ├── (auth)/                          ✅ Correct
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── auth/                            ❌ Duplicate auth structure
│       │   │   └── callback/
│       │   ├── forgot-password/                 ❌ Should be in (auth)/
│       │   └── reset-password/                  ❌ Should be in (auth)/
│       ├── components/
│       │   ├── TaskList.tsx                     ❌ Unclear vs TasksList
│       │   └── TasksList.tsx                    ❌ Unclear vs TaskList
│       ├── BETTER_AUTH_SETUP.md                 ❌ Should be in /docs/
│       └── BETTER_AUTH_QUICK_REFERENCE.md       ❌ Should be in /docs/
└── "Hackathon II - Todo Spec-Driven Development.md"  ❌ Root clutter
```

**Target Structure** (compliant):
```text
hackathon-2/
├── phase-2-web/
│   ├── docs/                                    ✅ NEW: Centralized documentation
│   │   ├── BETTER_AUTH_SETUP.md
│   │   └── BETTER_AUTH_QUICK_REFERENCE.md
│   ├── backend/
│   │   └── app/
│   │       ├── migrations/                      ✅ NEW: Dedicated migrations folder
│   │       │   ├── add_attachments_migration.py
│   │       │   ├── add_categories_migration.py
│   │       │   ├── add_comments_migration.py
│   │       │   ├── add_due_date_migration.py
│   │       │   ├── add_oauth_migration.py
│   │       │   ├── add_password_reset_migration.py
│   │       │   ├── add_priority_column.sql
│   │       │   ├── add_priority_migration.py
│   │       │   ├── add_recurring_tasks_migration.py
│   │       │   └── add_subtasks_migration.py
│   │       ├── routers/
│   │       ├── models/
│   │       └── ...
│   └── frontend/
│       ├── app/
│       │   ├── (auth)/                          ✅ CONSOLIDATED: All auth pages
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   ├── callback/                    ✅ MOVED from /auth/
│       │   │   ├── forgot-password/             ✅ MOVED from root
│       │   │   └── reset-password/              ✅ MOVED from root
│       │   └── (app)/                           ✅ Protected pages
│       └── components/
│           └── TasksList.tsx                    ✅ DECIDED: Keep TasksList, remove/rename TaskList
└── .gitignore                                   ✅ UPDATED: Exclude *.log, *:Zone.Identifier
```

**Structure Decision**:
- **Backend**: Create `/backend/app/migrations/` directory, move all 10 migration files using `git mv`
- **Frontend**: Consolidate all auth-related pages under `/(auth)/` route group per Next.js conventions
- **Documentation**: Create `/phase-2-web/docs/` directory, move Better Auth documentation
- **Components**: Rename TaskList.tsx to TaskListOld.tsx (deprecated), keep TasksList.tsx as canonical
- **Root**: Move large spec file to `/docs/hackathon/` or archive

## Complexity Tracking

**No Constitutional Violations to Justify** - This feature *fixes* existing violations rather than introducing new ones.

| Operation | Complexity Level | Risk Mitigation |
|-----------|------------------|-----------------|
| Move 10 migration files | Low | Use `git mv` to preserve history, verify no imports broken |
| Consolidate auth routes | Medium | Update Next.js routing, verify all auth flows still work |
| Create new directories | Low | Mkdir operations, no risk |
| Update .gitignore | Low | Append new patterns, verify with `git status` |
| Rename components | Medium | Find all imports, update, verify TypeScript build |

**Most Complex Operation**: Auth route consolidation - requires understanding Next.js App Router route groups and ensuring OAuth callback still functions after move.

---

## Phase 0: Research Tasks

**Objective**: Resolve all unknowns and establish best practices for safe file reorganization

### Research Items

1. **Git History Preservation**
   - Research: Best practices for `git mv` vs manual move + `git add`
   - Decision needed: Single commit vs multiple commits (one per category)
   - Tools: Git documentation, preservation verification commands

2. **Next.js Route Group Migration**
   - Research: Moving pages between route groups in App Router
   - Decision needed: Update route paths in auth callbacks/redirects?
   - Constraints: OAuth callback URL must remain valid

3. **Import Path Update Strategy**
   - Research: Tools for bulk import path updates (TypeScript LSP, sed, manual)
   - Decision needed: Automated tool vs manual find-replace
   - Verification: TypeScript compiler must pass

4. **Migration File Organization**
   - Research: Database migration folder naming conventions (numbered, dated, descriptive)
   - Decision needed: Rename migrations or keep as-is?
   - Best practice: Migration execution order documentation

5. **Component Deprecation Pattern**
   - Research: How to deprecate TaskList.tsx while keeping TasksList.tsx
   - Decision needed: Delete immediately vs deprecate with warning
   - Verification: Find all usages across codebase

### Research Output

Create `/specs/002-organize-folder-structure/research.md` documenting:
- Git mv command syntax and verification steps
- Next.js route group migration checklist
- Import update tooling recommendation
- Migration folder structure best practices
- Component deprecation strategy

---

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete with all decisions made

### 1. File Move Manifest (`contracts/file-moves.json`)

Create comprehensive JSON manifest of all file operations:

```json
{
  "version": "1.0.0",
  "feature": "002-organize-folder-structure",
  "operations": [
    {
      "type": "create_directory",
      "path": "phase-2-web/backend/app/migrations",
      "rationale": "FR-001: Migration files must be organized"
    },
    {
      "type": "git_mv",
      "source": "phase-2-web/backend/add_attachments_migration.py",
      "destination": "phase-2-web/backend/app/migrations/add_attachments_migration.py",
      "rationale": "FR-001: Organize migration files"
    },
    {
      "type": "git_mv",
      "source": "phase-2-web/frontend/app/forgot-password",
      "destination": "phase-2-web/frontend/app/(auth)/forgot-password",
      "rationale": "FR-002: Consolidate auth routes",
      "requires_import_updates": true,
      "affected_files": ["app/(app)/layout.tsx", "components/PasswordResetForm.tsx"]
    }
    // ... all 20+ operations
  ]
}
```

### 2. Verification Script (`contracts/verification.sh`)

Bash script to verify successful reorganization:

```bash
#!/bin/bash
# Post-reorganization verification

echo "=== Folder Structure Verification ==="

# FR-001: Migrations directory exists and has 10 files
if [ -d "phase-2-web/backend/app/migrations" ]; then
  COUNT=$(ls -1 phase-2-web/backend/app/migrations/*.py phase-2-web/backend/app/migrations/*.sql 2>/dev/null | wc -l)
  if [ "$COUNT" -eq 10 ]; then
    echo "✅ FR-001: 10 migration files in /migrations/"
  else
    echo "❌ FR-001: Expected 10 migration files, found $COUNT"
    exit 1
  fi
else
  echo "❌ FR-001: /migrations/ directory not found"
  exit 1
fi

# FR-002: Auth pages under (auth)/ route group
# FR-003: Documentation in /docs/
# FR-005: .gitignore updated
# ... more checks

echo "=== TypeScript Build Verification ==="
cd phase-2-web/frontend
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Frontend build succeeds"
else
  echo "❌ Frontend build failed - imports may be broken"
  exit 1
fi

echo "=== All Verifications Passed ==="
```

### 3. Quickstart Guide (`quickstart.md`)

Step-by-step execution guide for implementation phase:

```markdown
# Folder Organization Execution Guide

## Prerequisites
- Branch: 002-organize-folder-structure
- Working directory clean (no uncommitted changes)
- All tests passing before reorganization

## Execution Steps

### Step 1: Create New Directories
mkdir -p phase-2-web/backend/app/migrations
mkdir -p phase-2-web/docs

### Step 2: Move Migration Files (Preserve History)
git mv phase-2-web/backend/add_attachments_migration.py phase-2-web/backend/app/migrations/
git mv phase-2-web/backend/add_categories_migration.py phase-2-web/backend/app/migrations/
# ... (all 10 files)

### Step 3: Move Documentation
git mv phase-2-web/frontend/BETTER_AUTH_SETUP.md phase-2-web/docs/
git mv phase-2-web/frontend/BETTER_AUTH_QUICK_REFERENCE.md phase-2-web/docs/

### Step 4: Consolidate Auth Routes
git mv phase-2-web/frontend/app/forgot-password phase-2-web/frontend/app/(auth)/
git mv phase-2-web/frontend/app/reset-password phase-2-web/frontend/app/(auth)/
git mv phase-2-web/frontend/app/auth/callback phase-2-web/frontend/app/(auth)/callback
rmdir phase-2-web/frontend/app/auth

### Step 5: Update .gitignore
echo "*.log" >> .gitignore
echo "*:Zone.Identifier" >> .gitignore

### Step 6: Update Imports (if needed)
# Check for broken imports and fix

### Step 7: Verify Build
cd phase-2-web/frontend && npm run build

### Step 8: Run Verification Script
bash specs/002-organize-folder-structure/contracts/verification.sh

### Step 9: Commit
git add .gitignore
git commit -m "feat: organize project folder structure per constitution

- Move 10 migration files to backend/app/migrations/
- Consolidate auth routes under (auth)/ route group
- Centralize documentation in /docs/
- Update .gitignore to exclude log files
- Resolve TaskList vs TasksList naming

Fixes FR-001, FR-002, FR-003, FR-005 from spec
All constitution violations resolved

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 4. Data Model (N/A for this feature)

**Not applicable** - This feature performs file operations, not data modeling.

### 5. Agent Context Update

After completing Phase 1 design, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update `CLAUDE.md` with:
- New folder structure paths
- Migration directory location
- Documentation centralization
- Auth route organization

---

## Phase 2: Task Breakdown

**Out of scope for /sp.plan** - Tasks will be generated by `/sp.tasks` command.

Expected task categories:
1. **Directory Creation** (2-3 tasks)
2. **Migration File Moves** (10 tasks, one per file)
3. **Auth Route Consolidation** (4-5 tasks)
4. **Documentation Moves** (2 tasks)
5. **Component Resolution** (2 tasks)
6. **.gitignore Update** (1 task)
7. **Import Verification & Fixes** (3-5 tasks)
8. **Build Verification** (1 task)
9. **Cleanup** (1-2 tasks)

**Total estimated tasks**: 25-35 atomic, testable tasks

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Broken imports after file moves | Medium | High | TypeScript build verification, systematic import search |
| OAuth callback stops working | Low | High | Test auth flow before and after, document callback URL |
| Git history lost | Very Low | Medium | Use `git mv` exclusively, verify with `git log --follow` |
| Migration execution order unclear | Low | Medium | Document order in migrations/README.md |
| Rollback needed | Low | Medium | Entire change in single commit, easy `git revert` |

## Success Criteria

From spec.md:

- ✅ SC-001: Zero migration files in backend root (`ls phase-2-web/backend/*.py | grep migration` returns empty)
- ✅ SC-002: All auth pages under `/(auth)/` route structure
- ✅ SC-003: All documentation in `/phase-2-web/docs/`
- ✅ SC-004: Constitution validation passes
- ✅ SC-005: .gitignore excludes log files
- ✅ SC-006: `npm run build` exits with code 0

## Next Steps

1. Generate `research.md` (Phase 0)
2. Create `contracts/file-moves.json` (Phase 1)
3. Write `contracts/verification.sh` (Phase 1)
4. Write `quickstart.md` (Phase 1)
5. Update agent context via script
6. Run `/sp.tasks` to generate task breakdown
7. Execute tasks via `/sp.implement`
