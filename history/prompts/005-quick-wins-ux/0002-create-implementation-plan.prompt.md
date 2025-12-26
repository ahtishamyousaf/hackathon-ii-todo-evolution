---
id: 0002
title: Create Implementation Plan
stage: plan
feature: 005-quick-wins-ux
date: 2025-12-25
tags: [implementation-plan, technical-architecture, api-contracts, data-model, research-tasks]
---

# Prompt History Record: Create Implementation Plan

## Metadata

- **ID**: 0002
- **Stage**: plan (Implementation Planning)
- **Feature**: 005-quick-wins-ux
- **Date**: 2025-12-25
- **Duration**: ~20 minutes
- **Outcome**: Success - Comprehensive implementation plan created

## Context

Following the successful creation and validation of the Phase 1 specification (PHR 0001), the user confirmed readiness to proceed with implementation planning by saying "ok". The `/sp.plan` skill was invoked to create a detailed technical implementation plan.

The specification defined six UX enhancement features with 72 acceptance criteria, 15 success metrics, and comprehensive risk assessment. Now the plan phase translates business requirements into technical architecture, research tasks, data models, and API contracts.

## Prompt

User command:
```
/sp.plan
```

No additional arguments provided. The skill automatically reads the specification from `specs/005-quick-wins-ux/spec.md` and constitution from `.specify/memory/constitution.md`.

## Response Summary

### Actions Taken

1. **Setup Planning Environment**:
   - Ran `.specify/scripts/bash/setup-plan.sh --json` to get paths
   - Received: FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH paths
   - Loaded specification (spec.md), constitution, and plan template

2. **Created Comprehensive Implementation Plan** (`specs/005-quick-wins-ux/plan.md`):

   **Technical Context** (Complete):
   - Languages: TypeScript 5.x (frontend), Python 3.13+ (backend)
   - Dependencies: Next.js 16, React 18, FastAPI, SQLModel, PostgreSQL
   - New Libraries: @dnd-kit/core, @dnd-kit/sortable, react-dropzone, date-fns
   - Storage: PostgreSQL (Neon), local filesystem (backend/uploads/), localStorage
   - Testing: Jest, Playwright (frontend), pytest (backend)
   - Performance Goals: <16ms keyboard response, <3s bulk ops, <500ms search, 60fps drag
   - Constraints: Backward compatibility, WCAG 2.1 AA, works on 3-4 year old devices

   **Constitution Check** (All Passed ✅):
   - Spec-driven development: PASS
   - Simplicity and focus: PASS
   - Clean code standards: PASS
   - User experience excellence: PASS
   - Testability by design: PASS
   - Feature boundaries: PASS
   - No violations to justify

   **Project Structure** (Detailed):
   - Documentation: spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/
   - Frontend: 7 new components, 4 modified components, 5 new hooks, 4 new utilities, 4 new types
   - Backend: 1 modified model, 2 new routers, 2 new services, 2 new schemas, 1 new utility
   - Tests: 3 frontend unit tests, 5 E2E specs, 3 backend API tests
   - Migration: 005_add_task_sort_order.py

   **Phase 0: Research Tasks** (8 Research Areas):
   - RT1: Keyboard shortcut library evaluation (react-hotkeys-hook vs custom)
   - RT2: Drag & drop library selection (@dnd-kit vs alternatives)
   - RT3: File upload approach (react-dropzone vs native)
   - RT4: Search filter parsing strategy (regex vs tokenizer)
   - RT5: Database sort order strategy (NULL handling, auto-increment)
   - RT6: File storage location (local vs S3)
   - RT7: Offline capability strategy (localStorage vs IndexedDB)
   - RT8: Mobile drag & drop implementation (@dnd-kit touch sensors)

   **Phase 1: Design & Contracts**:
   - Data Model: Task.sort_order (nullable Integer), SearchHistory (optional)
   - Migration: ALTER TABLE tasks ADD COLUMN sort_order INTEGER NULL
   - API Contracts: 4 OpenAPI spec files (tasks-api, bulk-api, search-api, attachments-api)
   - Endpoints: PUT /api/tasks/reorder, POST /api/tasks/bulk-update, DELETE /api/tasks/bulk-delete, GET /api/tasks/search
   - Quickstart Guide: Installation, migration, development workflow, testing, troubleshooting

   **Implementation Sequence** (3-Week Timeline):
   - Phase 1A (Week 1): Keyboard shortcuts (2d), Smart dates (1d), Enhanced search (2d)
   - Phase 1B (Week 2): Drag & drop (3d), Bulk operations (2d)
   - Phase 1C (Week 3): File attachments (2d)
   - Total: 15 working days with parallelization opportunities

   **Risk Mitigation** (5 Risk Categories):
   - High: Drag & drop mobile performance, Bulk delete accidents
   - Medium: Keyboard shortcut conflicts, File upload failures
   - Low: Search filter complexity, Task order sync issues
   - Each with detailed mitigation strategies and contingency plans

   **Success Metrics** (15 Metrics):
   - Performance: 5 automated metrics (keyboard <16ms, bulk <3s, search <500ms, drag 60fps, upload >95%)
   - UX: 5 user testing metrics (40% shortcut adoption, 80% mobile drag success, etc.)
   - Functional: 5 QA checklist items (cross-browser, mobile parity, accessibility, persistence)

3. **Structured Plan Sections**:
   - Summary: 3-sentence overview + technical approach
   - Technical Context: 9 complete sections (no "NEEDS CLARIFICATION" markers)
   - Constitution Check: All 6 principles verified + compliance summary
   - Project Structure: Complete file tree for docs and source code
   - Complexity Tracking: N/A (no violations)
   - Phase 0 Research: 8 detailed research tasks with decision criteria
   - Phase 1 Design: Data models, API contracts (OpenAPI YAML), quickstart guide
   - Implementation Sequence: 3-phase breakdown with timeline and dependencies
   - Risk Mitigation: 6 risks with detailed mitigation + contingencies
   - Success Metrics: 15 measurable outcomes
   - Next Steps: 5 actionable items after plan completion

4. **Technical Decisions Made**:
   - Web application structure (frontend/backend separation)
   - Extend existing architecture (no restructuring needed)
   - Context provider pattern for keyboard shortcuts
   - Wrapper pattern for drag & drop (DraggableTaskItem wraps TaskItem)
   - Overlay pattern for bulk toolbar (doesn't change layout)
   - Parser utility for search filters (regex-based)
   - Nullable migration strategy for sort_order (backward compatible)

5. **Deferred to Research Phase**:
   - Specific library choices (8 research tasks to validate)
   - Offline strategy details (complexity vs value trade-off)
   - Natural language date parsing (out of scope for Phase 1)
   - Search history storage location (backend vs frontend-only)

### Key Decisions

1. **Technology Stack Continuity**: No architectural changes needed. All features integrate into existing Next.js/FastAPI structure.

2. **Migration Strategy**: Nullable sort_order field ensures backward compatibility. Existing tasks without sort_order display at end of list.

3. **API Design**: RESTful endpoints with clear contracts. Bulk operations use POST/DELETE with JSON bodies. Search uses GET with query parameters.

4. **Component Architecture**: Wrapper and context provider patterns to avoid modifying existing component internals. New components integrate via composition.

5. **Testing Strategy**: 3-layer testing (unit, E2E, manual). Performance metrics automated via Lighthouse and Chrome DevTools.

6. **Implementation Sequencing**: Foundation features first (keyboard, dates, search), then visual interactions (drag, bulk), then infrastructure-dependent (files).

7. **Risk Prioritization**: High-risk items (mobile drag, bulk delete) get extensive mitigation. Low-risk items (search complexity) rely on good UX.

8. **Success Measurement**: 15 specific metrics across performance, UX, and functional completeness. All objectively verifiable.

### Deliverables

1. **Implementation Plan**: 1,147-line comprehensive plan document
2. **Research Framework**: 8 research tasks with clear decision criteria
3. **Data Model Spec**: Task.sort_order + SearchHistory with migration SQL
4. **API Contracts**: 4 OpenAPI YAML specifications (embedded in plan)
5. **Quickstart Guide**: Complete developer setup and workflow guide (embedded)
6. **Implementation Timeline**: 3-week schedule with daily breakdown
7. **Risk Assessment**: 6 risks with detailed mitigation strategies
8. **Success Metrics**: 15 measurable outcomes for validation

### Plan Highlights

**Strengths**:
1. **Complete Technical Context**: All 9 sections filled with concrete details, zero "NEEDS CLARIFICATION" markers
2. **Constitutional Compliance**: All 6 principles verified, no violations require justification
3. **Detailed File Structure**: 237-line source tree showing every new and modified file
4. **Research-Driven**: 8 research tasks ensure informed technology choices before implementation
5. **Contract-First API Design**: OpenAPI specifications define all 6 new/modified endpoints
6. **Comprehensive Risk Management**: 6 risks with mitigation + contingency plans
7. **Measurable Success**: 15 specific metrics with testing methodology
8. **Implementation Ready**: Daily breakdown, parallelization opportunities, critical path identified

**Research Phase Preparation**:
- 8 research tasks cover all unknowns (libraries, strategies, best practices)
- Decision criteria ensure objective library selection
- Expected research.md format provided for consistency
- Best practices sections guide implementation patterns

**Design Phase Preparation**:
- Data model changes specified with SQL migration
- API contracts provide complete endpoint specifications
- Quickstart guide includes installation, workflow, testing, troubleshooting
- Agent context update script documented for CLAUDE.md

**Implementation Phase Preparation**:
- 3-week timeline with 15 working days
- Phase 1A/1B/1C sequence with dependencies identified
- Parallelization opportunities for concurrent development
- Milestones at end of each week

## Lessons Learned

1. **Comprehensive Planning Pays Off**: By specifying all technical details upfront (languages, dependencies, storage, testing, performance goals), the plan provides complete context for implementation without back-and-forth.

2. **Research Tasks Prevent Premature Decisions**: Identifying 8 research areas (library choices, strategies) allows informed decisions based on evaluation rather than assumptions. Decision criteria ensure objective selection.

3. **Constitution as Quality Gate**: Checking all 6 constitutional principles ensures plan aligns with project values. Zero violations indicates well-scoped, maintainable approach.

4. **Risk-First Thinking**: Identifying and categorizing risks (High/Medium/Low) with specific mitigation strategies prevents surprises during implementation. Contingency plans provide fallback options.

5. **Contract-Driven Development**: OpenAPI specifications for all endpoints provide clear contracts for frontend/backend integration. Reduces integration issues.

6. **Timeline Realism**: 3-week estimate based on feature complexity breakdown. Daily granularity with parallelization opportunities provides realistic schedule.

7. **Success Metrics Drive Quality**: 15 specific, measurable metrics (with testing methodology) ensure objective validation of feature completeness and quality.

8. **Structure Clarity**: Detailed file tree (237 lines) showing every new and modified file eliminates ambiguity about "where does this code go?"

## Next Steps

**Immediate** (Phase 0 - Research):

1. **Execute Research Tasks**: Address all 8 research tasks (RT1-RT8):
   - Evaluate keyboard shortcut libraries (react-hotkeys-hook vs custom)
   - Confirm @dnd-kit for drag & drop (vs react-beautiful-dnd)
   - Validate react-dropzone for file uploads
   - Prototype search filter parser (regex vs tokenizer)
   - Design sort_order strategy (NULL handling, auto-increment)
   - Decide file storage (local vs S3 for Phase 1)
   - Determine offline capability scope (defer to Phase 2?)
   - Test mobile drag & drop (@dnd-kit touch sensors)

2. **Document Research Findings** (`research.md`):
   - For each RT task: Decision, Rationale, Alternatives Considered, Impact
   - Add Best Practices sections for each feature area
   - Validate all decisions against spec requirements

**Phase 1 (Design & Contracts)**:

3. **Create Data Model Document** (`data-model.md`):
   - Document Task.sort_order field specification
   - Document SearchHistory entity (if backend storage chosen)
   - Provide complete migration SQL

4. **Create API Contract Files** (`contracts/*.yaml`):
   - tasks-api.yaml: Extended task endpoints with sort_order
   - bulk-api.yaml: Bulk update and delete endpoints
   - search-api.yaml: Advanced search with filter parameters
   - attachments-api.yaml: Verify existing endpoints work

5. **Create Quickstart Guide** (`quickstart.md`):
   - Installation instructions for new dependencies
   - Database migration steps
   - Development workflow for each feature
   - Testing commands and checklists
   - Troubleshooting guide

6. **Update Agent Context**:
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - Add @dnd-kit, react-dropzone, date-fns to CLAUDE.md

**Phase 2 (Task Breakdown)**:

7. **Execute `/sp.tasks`**: Break implementation plan into actionable development tasks
8. **Begin Implementation**: Follow Phase 1A → 1B → 1C sequence

## Related Documents

- **Feature Specification**: [specs/005-quick-wins-ux/spec.md](../../specs/005-quick-wins-ux/spec.md)
- **Implementation Plan**: [specs/005-quick-wins-ux/plan.md](../../specs/005-quick-wins-ux/plan.md)
- **Quality Checklist**: [specs/005-quick-wins-ux/checklists/requirements.md](../../specs/005-quick-wins-ux/checklists/requirements.md)
- **Previous PHR**: [0001-create-phase1-specification.prompt.md](./0001-create-phase1-specification.prompt.md)
- **Project Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

## Tags

#implementation-plan #technical-architecture #api-contracts #data-model #research-tasks #keyboard-shortcuts #drag-drop #bulk-operations #file-attachments #smart-dates #enhanced-search #phase-planning #risk-assessment #success-metrics
