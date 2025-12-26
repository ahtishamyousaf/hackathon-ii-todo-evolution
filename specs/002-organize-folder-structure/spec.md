# Feature Specification: Organize Project Folder Structure

**Feature Branch**: `002-organize-folder-structure`
**Created**: 2025-12-23
**Status**: Draft
**Type**: Technical Debt / Project Organization
**Input**: User description: "Organize Project Folder Structure - Reorganize 10 migration files from backend root to migrations directory, consolidate auth routes, move documentation, clean up duplicates, fix constitution violations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developers Can Easily Find Migration Files (Priority: P1)

As a developer working on database changes, I need all migration files organized in a dedicated migrations directory so that I can quickly locate, review, and run database migrations without searching through the backend root folder.

**Why this priority**: Scattered migration files violate project structure standards and make database management error-prone. This is a critical constitution violation blocking clean project organization.

**Independent Test**: Navigate to backend directory and locate migrations folder. Success = all 10 migration files are in `/backend/app/migrations/` (or `/backend/migrations/`) and none remain in backend root.

**Acceptance Scenarios**:

1. **Given** migration files are scattered in backend root, **When** I need to find database migrations, **Then** all migrations are in a single `/migrations/` directory
2. **Given** new migrations need to be created, **When** I look for the migrations folder, **Then** there's a clear, dedicated location following convention
3. **Given** I'm reviewing project structure, **When** I check backend root directory, **Then** no migration files clutter the root level

---

### User Story 2 - Developers Can Navigate Auth Routes Consistently (Priority: P1)

As a developer working on authentication, I need all auth-related pages organized under a consistent route structure so that I can quickly locate login, register, callback, and password recovery pages without confusion.

**Why this priority**: Mixed auth directory structures (`(auth)/` vs `/auth/` vs root-level) violate Next.js conventions and the constitution's prescribed structure. This causes confusion and maintenance issues.

**Independent Test**: Check all auth-related pages are under `(auth)/` route group. Success = no auth pages at root level, single consistent auth structure.

**Acceptance Scenarios**:

1. **Given** auth pages are scattered across multiple directories, **When** I need to find login/register pages, **Then** all auth pages are under `/app/(auth)/` route group
2. **Given** OAuth callback functionality exists, **When** I look for callback handler, **Then** it's located at `/(auth)/callback/` or clearly documented if exception needed
3. **Given** password recovery pages exist, **When** I navigate auth routes, **Then** forgot-password and reset-password are under `/(auth)/` route group

---

### User Story 3 - Team Can Access Documentation Easily (Priority: P2)

As a team member onboarding or referencing setup guides, I need documentation files organized in a central documentation directory so that I can quickly find setup guides, references, and project documentation.

**Why this priority**: Documentation scattered in module directories (like frontend root) is hard to discover. Central documentation improves onboarding and reduces setup friction.

**Independent Test**: Check for `/phase-2-web/docs/` directory containing all documentation. Success = Better Auth docs moved from frontend root to docs folder.

**Acceptance Scenarios**:

1. **Given** Better Auth documentation exists in frontend root, **When** I look for project documentation, **Then** all docs are in `/phase-2-web/docs/` directory
2. **Given** new documentation needs to be added, **When** I determine the location, **Then** there's a clear, centralized docs directory
3. **Given** I'm searching for setup guides, **When** I check the docs folder, **Then** BETTER_AUTH_SETUP.md and BETTER_AUTH_QUICK_REFERENCE.md are easily found

---

### User Story 4 - Developers Understand Component Purpose Clearly (Priority: P2)

As a developer using task components, I need clear distinction between TaskList and TasksList components so that I can choose the correct component without confusion or duplicate code.

**Why this priority**: Duplicate or similarly-named components cause confusion, increase maintenance burden, and violate clean code principles.

**Independent Test**: Review components directory for duplicate task components. Success = clear distinction documented or duplicates removed/consolidated.

**Acceptance Scenarios**:

1. **Given** two similar task components exist, **When** I need to display tasks, **Then** component names clearly indicate their different purposes OR duplicates are consolidated
2. **Given** component documentation exists, **When** I read about TaskList vs TasksList, **Then** the distinction is clearly explained
3. **Given** I'm refactoring task views, **When** I review component usage, **Then** no unnecessary duplication exists

---

### User Story 5 - Repository Stays Clean of Generated Files (Priority: P3)

As a developer maintaining the repository, I need log files and OS artifacts excluded from git tracking so that the repository remains clean and focused on source code.

**Why this priority**: Log files and OS artifacts (Zone.Identifier, etc.) pollute git history and inflate repository size unnecessarily.

**Independent Test**: Check .gitignore includes common generated files. Success = backend.log ignored, Zone.Identifier files ignored, no large log files in git history.

**Acceptance Scenarios**:

1. **Given** log files are generated during development, **When** I run git status, **Then** log files don't appear as untracked
2. **Given** Windows creates Zone.Identifier files, **When** I work across platforms, **Then** these artifacts are automatically ignored
3. **Given** the repository is cloned, **When** I check repository size, **Then** no large log files inflate the download

---

### Edge Cases

- What happens if migration files have dependencies on each other?
  - Document migration order in a README.md within migrations folder
  - Numbering prefix (e.g., 001_add_categories.py) helps maintain order

- How do we handle OAuth callback if it must be separate from (auth)/ group?
  - Document the architectural reason in spec
  - Add comment in routing structure explaining the exception

- What if documentation grows to multiple categories?
  - Create subdirectories within /docs/ (e.g., /docs/auth/, /docs/api/)
  - Maintain a docs/README.md with navigation

- What happens to existing component imports after consolidation?
  - Update all import statements
  - Run build to verify no broken imports
  - Use IDE refactoring tools for bulk updates

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All database migration files MUST be located in `/backend/app/migrations/` or `/backend/migrations/` directory (not backend root)
- **FR-002**: All authentication pages MUST be organized under `/app/(auth)/` route group following Next.js conventions
- **FR-003**: All project documentation MUST be centralized in `/phase-2-web/docs/` directory
- **FR-004**: Component naming MUST be unambiguous OR duplicate components MUST be consolidated with clear documentation
- **FR-005**: Git ignore rules MUST exclude log files (*.log) and OS artifacts (*:Zone.Identifier, .DS_Store)
- **FR-006**: Project structure MUST comply with Phase II constitution's prescribed organization
- **FR-007**: Empty or incorrectly named directories (like `/all]/`) MUST be removed
- **FR-008**: Large untracked specification files at root MUST be organized into appropriate directories or archived

### Key Entities *(organizational - no data entities)*

This is an organizational feature affecting file/folder structure:

- **Backend Migrations Directory**: Contains 10 migration files (add_attachments, add_categories, add_comments, add_due_date, add_oauth, add_password_reset, add_priority, add_recurring_tasks, add_subtasks, add_priority_column.sql)
- **Auth Route Group**: Contains login, register, callback, forgot-password, reset-password pages
- **Documentation Directory**: Contains Better Auth setup guides and references
- **Components Directory**: Contains TaskList and TasksList (needs clarification/consolidation)
- **Git Ignore Configuration**: Defines exclusion patterns for generated files

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero migration files remain in backend root directory (verified by `ls phase-2-web/backend/*.py | grep migration` returns empty)
- **SC-002**: All auth pages accessible under consistent `/app/(auth)/*` route structure (verified by checking file paths)
- **SC-003**: All documentation discoverable in single `/phase-2-web/docs/` directory (verified by docs folder existence and contents)
- **SC-004**: Project structure validation passes against Phase II constitution checklist (verified manually or via script)
- **SC-005**: Repository size reduces by excluding log files (verified by checking .gitignore effectiveness)
- **SC-006**: Build succeeds after reorganization with zero import errors (verified by `npm run build` exit code 0)

## Scope *(mandatory)*

### In Scope

- Move 10 migration files from backend root to `/backend/app/migrations/` directory
- Consolidate auth routes under `/(auth)/` route group
- Move Better Auth documentation from frontend root to `/phase-2-web/docs/`
- Clarify or consolidate TaskList vs TasksList components
- Update .gitignore to exclude log files and OS artifacts
- Remove empty/incorrectly named directories
- Organize or archive large untracked specification files
- Update all import statements affected by moves
- Verify builds succeed after reorganization

### Out of Scope

- Refactoring migration file contents
- Changing authentication logic or flows
- Rewriting documentation content
- Adding new features or components
- Database schema migrations or data changes
- Changing Better Auth configuration
- Performance optimizations
- Adding new utilities or types

## Implementation Notes *(optional but recommended)*

### Organizational Changes Summary

Based on comprehensive folder structure analysis, 10 major issues identified:

1. **HIGH PRIORITY**: 10 migration files in backend root → `/backend/app/migrations/`
2. **HIGH PRIORITY**: Root-level untracked files → organize or archive
3. **MEDIUM PRIORITY**: Duplicate auth directories → consolidate under `/(auth)/`
4. **MEDIUM PRIORITY**: Documentation misplaced → move to `/docs/`
5. **MEDIUM PRIORITY**: TaskList vs TasksList confusion → clarify or consolidate
6. **LOW PRIORITY**: Large log file (backend.log 1.1MB) → add to .gitignore
7. **LOW PRIORITY**: Empty directory `/all]/` → remove
8. **LOW PRIORITY**: Missing frontend types for oauth_account/password_reset → note for future
9. **LOW PRIORITY**: Specs organization inconsistency → note for future
10. **LOW PRIORITY**: Minimal utilities → note for future development

### Constitution Compliance

This reorganization addresses violations of Phase II Constitution section "Project Structure":
- Backend migrations must follow organized pattern
- Frontend auth pages must be in (auth)/ route group
- Documentation should be discoverable

### Why This Organization Matters

- **Discoverability**: Developers can find files quickly following conventions
- **Maintainability**: Clear structure reduces cognitive load
- **Scalability**: Proper organization supports growth
- **Constitution Compliance**: Aligns with project standards
- **Best Practices**: Follows Next.js and FastAPI conventions

## Assumptions *(optional but recommended)*

1. Migration files can be moved without breaking existing migration history
2. Auth route consolidation won't break existing authentication flows
3. Documentation move won't break any automated documentation tools
4. Component renames/consolidation can be completed without major refactoring
5. Import statement updates will be caught by TypeScript compiler
6. No hard-coded file paths exist that would break after reorganization
7. Team agrees with proposed organizational structure

## Dependencies *(optional but recommended)*

### Technical Dependencies

- **Git**: For moving files while preserving history
- **TypeScript Compiler**: To verify imports after reorganization
- **Next.js Build**: To verify routes work after auth consolidation
- **Phase II Constitution**: Reference document for structure standards

### Knowledge Dependencies

- Understanding of Next.js route groups and conventions
- Understanding of FastAPI project structure patterns
- Understanding of git file operations (mv vs manual move)
- Understanding of import resolution in TypeScript/Python

## Risks & Mitigations *(optional but recommended)*

### Risks

1. **Risk**: Moving migration files might break migration history or tools
   **Mitigation**: Use `git mv` to preserve history, test migrations after move

2. **Risk**: Consolidating auth routes might break existing links or redirects
   **Mitigation**: Check all auth-related redirects, update environment config if needed

3. **Risk**: Import statement updates might be missed causing runtime errors
   **Mitigation**: Run full TypeScript build, use IDE's "find all references" feature

4. **Risk**: Documentation move might break CI/CD documentation tools
   **Mitigation**: Check CI/CD config for any hard-coded doc paths

5. **Risk**: Component consolidation might introduce breaking changes
   **Mitigation**: Review all usages before consolidating, consider deprecation path

## References *(optional but recommended)*

### Documentation

- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [FastAPI Project Structure](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Git mv Documentation](https://git-scm.com/docs/git-mv)

### Related Specifications

- Phase II Constitution: `phase-2-web/constitution.md` - See "Project Structure" section
- Folder Structure Analysis Report: From explore agent (agentId: a70122e)

### Files Affected

This reorganization affects:
- 10 backend migration files
- 5-6 auth-related frontend pages
- 2 documentation files
- 2 task component files (potentially)
- 1 .gitignore file
- Multiple import statements across the codebase

---

**Next Steps**: After spec approval, proceed with `/sp.plan` to create detailed implementation plan with step-by-step file operations.
