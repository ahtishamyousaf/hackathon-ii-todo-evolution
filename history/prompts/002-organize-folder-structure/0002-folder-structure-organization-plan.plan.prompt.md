---
id: 0002
title: Folder Structure Organization Plan
stage: plan
date: 2025-12-23
surface: cli
model: claude-sonnet-4-5-20250929
feature: 002-organize-folder-structure
branch: 002-organize-folder-structure
user: external
command: sp.plan
labels: [folder-organization, git-operations, file-moves, constitution-compliance]
links:
  spec: specs/002-organize-folder-structure/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - path: specs/002-organize-folder-structure/plan.md
    status: created
  - path: specs/002-organize-folder-structure/research.md
    status: created
  - path: specs/002-organize-folder-structure/quickstart.md
    status: created
  - path: specs/002-organize-folder-structure/contracts/file-moves.json
    status: created
  - path: specs/002-organize-folder-structure/contracts/verification.sh
    status: created
tests:
  - name: Constitution Check
    command: Manual review
    status: passed
  - name: Research Completeness
    command: Manual review
    status: passed
---

## Prompt

Execute sp.plan workflow for feature 002-organize-folder-structure. Create implementation plan based on approved specification.

Context: Specification completed and validated (all requirements checklist items passed). Feature addresses 10 organizational issues violating Phase II constitution. This is a file operations task (moving/organizing files) rather than code development task.

Primary operations:
- Move 10 migration files from backend root to /backend/app/migrations/
- Consolidate auth routes under (auth)/ route group
- Centralize documentation in /docs/
- Resolve component naming (TaskList vs TasksList)
- Update .gitignore for log files
- Preserve git history using git mv

## Response snapshot

Successfully created comprehensive implementation plan completing Phase 0 (Research) and Phase 1 (Design & Contracts):

**Plan File**: `specs/002-organize-folder-structure/plan.md` (442 lines)

**Technical Context**:
- Language/Version: N/A (file operations, git commands)
- Primary Dependencies: Git 2.x, TypeScript compiler, npm/Node.js
- Project Type: Web (Next.js 16 + FastAPI monorepo)
- Constraints: MUST preserve git history, MUST NOT break imports
- Scale: 20+ file operations, ~10 potential import updates

**Constitution Check**: PASSED with justification
- Currently failing constitution requirements (purpose of this feature)
- Will resolve all violations upon completion
- Gates passed: Spec-Driven Dev, No Manual Coding, Process Documentation

**Phase 0 Research** (`research.md` created - 135 lines):
1. **Git History Preservation**: Decided to use `git mv` exclusively, single atomic commit
2. **Next.js Route Migration**: Routes auto-update, verify OAuth callback (URL changes from /auth/callback to /callback)
3. **Import Updates**: Manual search + TypeScript verification (small scope <10 imports)
4. **Migration Organization**: Keep existing filenames, add README.md for execution order
5. **Component Deprecation**: Keep TasksList, rename TaskList → TaskListOld with deprecation comment

All research decisions documented with rationale and alternatives considered.

**Phase 1 Design & Contracts** (4 files created):

1. **File Move Manifest** (`contracts/file-moves.json` - 177 lines):
   - 22 total operations (21 mandatory, 1 optional)
   - Each operation has ID, type, rationale, affected files
   - Operations: 2 directories created, 18 files moved, 1 file updated, 1 file created, 1 directory removed
   - Comprehensive verification checklist embedded

2. **Verification Script** (`contracts/verification.sh` - 182 lines, executable):
   - Automated checks for all 6 success criteria (SC-001 through SC-006)
   - Validates FR-001 through FR-005 from spec
   - Verifies TypeScript build succeeds
   - Checks git history preservation
   - Color-coded output (green/red/yellow)
   - Exit code 0 = all pass, 1 = failures detected

3. **Quickstart Guide** (`quickstart.md` - 397 lines):
   - 14-step execution guide with commands
   - Verification commands after each step
   - OAuth callback URL change warning (BREAKING CHANGE)
   - Troubleshooting section for common issues
   - Rollback plan using git revert
   - Success criteria checklist
   - Files modified summary

4. **Agent Context Update**:
   - Updated CLAUDE.md with new folder structure
   - Added git operations context
   - Documented file reorganization approach

**Risk Assessment**:
- Broken imports: Medium likelihood, High impact → TypeScript build verification
- OAuth callback fails: Low likelihood, High impact → Test auth flow, document URL change
- Git history lost: Very Low likelihood, Medium impact → Use git mv exclusively
- Migration order unclear: Low likelihood, Medium impact → Document in README.md
- Rollback needed: Low likelihood, Medium impact → Single commit, easy revert

**Complexity Tracking**: No constitutional violations to justify - this feature *fixes* existing violations.

**Structure Decisions**:
- Backend: `/backend/app/migrations/` for all 10 migration files
- Frontend: `/(auth)/` route group for all 5 auth pages (login, register, callback, forgot-password, reset-password)
- Documentation: `/phase-2-web/docs/` for centralized docs
- Components: TasksList is canonical, TaskList → TaskListOld (deprecated)

## Outcome

- ✅ Impact: Complete implementation plan with research, contracts, and execution guide ready. All unknowns resolved. Constitution check passed with violations justified (fixing them is the feature's purpose).
- 🧪 Tests: Research completeness validated, constitution check passed, file manifest covers all 22 operations
- 📁 Files: Created plan.md (442 lines), research.md (135 lines), quickstart.md (397 lines), file-moves.json (177 lines), verification.sh (182 lines, executable)
- 🔁 Next prompts: sp.tasks (generate task breakdown from plan), sp.implement (execute tasks), sp.adr (document architectural decisions if needed)
- 🧠 Reflection: This is an unusual feature - organizing files rather than writing code. Research phase was critical to decide on git mv strategy and OAuth callback implications. Verification script will be essential to ensure nothing breaks. The quickstart guide is very detailed because manual testing (OAuth flow) is required.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan creation successful, research resolved all unknowns on first attempt
- Graders run and results (PASS/FAIL): Constitution Check - PASS (violations justified), Research Completeness - PASS (all 5 research items resolved)
- Prompt variant (if applicable): Standard sp.plan workflow adapted for file operations task (no data-model.md, emphasis on git operations)
- Next experiment (smallest change to try): Generate tasks.md using sp.tasks command, breaking down 22 operations into atomic testable tasks (~25-35 tasks expected)
