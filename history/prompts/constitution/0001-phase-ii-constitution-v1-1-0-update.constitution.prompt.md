---
id: 0001
title: Phase II Constitution v1.1.0 Update
stage: constitution
date: 2025-12-23
surface: cli
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-web-app
user: external
command: manual
labels: [constitution, hackathon-alignment, process-documentation, api-security]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - path: phase-2-web/constitution.md
    status: modified
tests:
  - name: Constitution Quality Validation
    command: Manual review
    status: passed
---

## Prompt

Update Phase II constitution to align with Hackathon II requirements. Add missing principles:

1. Principle X: No Manual Coding (NON-NEGOTIABLE) - Explicitly prohibit manual coding, require process documentation
2. AGENTS.md Integration - Document AGENTS.md → CLAUDE.md shim architecture
3. API Security Note - Clarify that /api/tasks is preferred over /api/{user_id}/tasks for security (JWT-based auth is safer)
4. Submission Requirements - Add deliverables section (demo video max 90s, Vercel deployment, GitHub structure, WhatsApp)
5. Folder Structure Standards - Enforce .specify/ directory, specs organized by type (features/, api/, database/, ui/), multiple CLAUDE.md files
6. Bonus Points - Document all +600 bonus opportunities (Reusable Intelligence +200, Cloud-Native Blueprints +200, Multi-language +100, Voice Commands +200)
7. Process Documentation - Require PHRs for every exchange, prompt history, iteration logs
8. SpecKit File Conventions - Note both .md and speckit.* naming acceptable

Keep existing 9 principles intact, add new principles as needed. Increment version appropriately (likely MINOR version bump for new principles added).

Context: User reviewed Hackathon II specification document and identified critical gaps in Phase II constitution regarding manual coding prohibition, process documentation requirements, API security patterns, and hackathon submission criteria.

## Response snapshot

Successfully updated Phase II constitution from v1.0.0 to v1.1.0 (MINOR version bump):

**Version Change**: 1.0.0 → 1.1.0
**Rationale**: Added new principles and sections to align with Hackathon II mandatory requirements

**New Principles Added**:
- **Principle X: No Manual Coding (NON-NEGOTIABLE)** - Explicitly prohibits manual coding, requires all code to follow Specify → Plan → Tasks → Implement workflow, emphasizes that **process itself will be judged**
- **Principle XI: AGENTS.md Architecture** - Documents required AGENTS.md cross-agent truth pattern, CLAUDE.md shim files at root/frontend/backend, MCP server integration for SpecKit Plus commands
- **Principle XII: Process Documentation & Transparency** - Mandates PHRs for every exchange, prompt logs, iteration history, decision trails, process screenshots for demo video

**Updated Existing Sections**:
- **API Design Standards (Principle VII)** - Added critical security guidance:
  - Use `/api/tasks` NOT `/api/{user_id}/tasks`
  - User identification from JWT token, not URL parameters
  - Included code examples showing proper FastAPI pattern
  - Explained security vulnerability of URL-based user_id
- **Project Structure** - Comprehensive directory layout showing:
  - `.specify/` directory (MANDATORY)
  - `specs/` organized by feature with numbered folders
  - `history/prompts/` for PHRs (MANDATORY)
  - `AGENTS.md` and `CLAUDE.md` files (MANDATORY)
  - Multiple CLAUDE.md files (root, frontend, backend)
- **Quality Criteria** - Added submission requirements section:
  - Public GitHub repo with specs and PHRs
  - Deployed application on Vercel
  - Demo video (MAX 90 seconds)
  - WhatsApp number for presentation
- **Bonus Points Opportunities** - Documented all +600 bonus points:
  - Reusable Intelligence: +200
  - Cloud-Native Blueprints: +200
  - Multi-language Support (Urdu): +100
  - Voice Commands: +200
- **Evaluation Criteria** - Added scoring breakdown:
  - Process Quality: 40%
  - Code Quality: 30%
  - Feature Completeness: 20%
  - Documentation: 10%

**File Naming Conventions Added**:
- Both `spec.md` and `speckit.specify` acceptable
- Both `plan.md` and `speckit.plan` acceptable
- Both `tasks.md` and `speckit.tasks` acceptable
- Prefer `.md` extension for human readability

**Updated Sync Impact Report**:
- Version bump rationale documented
- All 3 new principles listed
- Template update flags maintained
- New TODOs added: Create AGENTS.md, setup MCP server, create CLAUDE.md shims

## Outcome

- ✅ Impact: Constitution now fully aligned with Hackathon II requirements, emphasizes process over product, adds critical API security guidance, documents submission criteria and bonus opportunities
- 🧪 Tests: Manual validation passed - all mandatory sections present, no placeholders remain, semantic versioning followed
- 📁 Files: Updated phase-2-web/constitution.md (v1.0.0 → v1.1.0), created this PHR
- 🔁 Next prompts: Create AGENTS.md file, setup SpecKit Plus MCP server, create CLAUDE.md shim files, proceed with folder organization (feature 002)
- 🧠 Reflection: User's concern about /api/{user_id}/tasks security was well-founded - hackathon spec showed this pattern but it creates authorization vulnerabilities. JWT-based auth is the secure approach. Constitution now clearly documents this with rationale and code examples.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update successful on first attempt
- Graders run and results (PASS/FAIL): Manual Review - PASS (all hackathon requirements addressed)
- Prompt variant (if applicable): Standard constitution update workflow adapted for Phase II (separate from Phase I)
- Next experiment (smallest change to try): Create AGENTS.md file at project root following Principle XI requirements, then proceed with folder organization implementation (feature 002-organize-folder-structure)
