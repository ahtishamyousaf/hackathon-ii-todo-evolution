# AGENTS.md - Cross-Agent Truth for Hackathon II

**Version**: 1.0.0
**Last Updated**: 2025-12-26
**Purpose**: Define how ALL AI agents (Claude Code, GitHub Copilot, Gemini, etc.) should behave when working on this project

---

## Core Directive: Spec-Driven Development Only

**NON-NEGOTIABLE RULE**: You MUST NOT write code manually. All code generation follows the Spec-Driven Development workflow.

### Workflow Hierarchy (MANDATORY)

```
Constitution → Specify → Plan → Tasks → Implement → Test → Commit
     ↓            ↓        ↓       ↓         ↓         ↓       ↓
  Principles   spec.md  plan.md tasks.md  Code Gen  Validate PHR
```

**Every line of code MUST trace back through this chain.**

---

## Agent Behavior Rules

### 1. NO Freestyle Coding

❌ **NEVER DO THIS**:
- "I'll just add this feature quickly"
- "Let me fix this bug real fast"
- "This is a simple change, no need for a spec"
- "I'll implement this and we can document it later"

✅ **ALWAYS DO THIS**:
- Read the constitution first
- Check if a spec exists for this feature
- If no spec, create one using `/sp.specify`
- Follow the complete workflow: Specify → Plan → Tasks → Implement

### 2. NO Inferring Requirements

❌ **NEVER ASSUME**:
- "The user probably wants X"
- "This seems like a good default"
- "I'll add error handling that wasn't mentioned"
- "Let me make this more generic"

✅ **ONLY IMPLEMENT**:
- What's explicitly in the spec
- What's in the acceptance criteria
- What's in the tasks.md breakdown
- Nothing more, nothing less

### 3. ALWAYS Reference Documents

**Before any code generation**:
1. Read `/phase-2-web/constitution.md` (Principle I-XII)
2. Read the feature's `spec.md`
3. Read the feature's `plan.md`
4. Read the feature's `tasks.md`
5. Check the current task you're implementing

**During code generation**:
- Reference task IDs (e.g., "Implementing T042 from tasks.md")
- Quote acceptance criteria being satisfied
- Trace decision back to spec requirement

**After code generation**:
- Create PHR using `/sp.phr`
- Update CLAUDE.md if new patterns emerge
- Document decisions in ADR if architectural

---

## SpecKit Plus Lifecycle

### Commands Available (via MCP Server)

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/sp.specify` | Create feature specification | Starting any new feature |
| `/sp.clarify` | Ask user for requirement clarification | Spec has ambiguities |
| `/sp.plan` | Generate implementation plan | After spec is approved |
| `/sp.tasks` | Break plan into actionable tasks | After plan is approved |
| `/sp.analyze` | Check cross-artifact consistency | After tasks are generated |
| `/sp.implement` | Execute tasks from tasks.md | After analysis passes |
| `/sp.adr` | Document architectural decisions | When making design choices |
| `/sp.git.commit_pr` | Commit and create PR | After implementation complete |
| `/sp.phr` | Record prompt history | After every major exchange |

### Workflow Example

```bash
# 1. User requests: "Add recurring tasks feature"

# 2. You respond:
"I'll create a specification for recurring tasks using /sp.specify"

# 3. Create spec
/sp.specify "Add recurring tasks with daily/weekly/monthly patterns"

# 4. If unclear, clarify
/sp.clarify  # Ask user about edge cases

# 5. Generate plan
/sp.plan

# 6. Break into tasks
/sp.tasks

# 7. Analyze consistency
/sp.analyze

# 8. Implement
/sp.implement

# 9. Document decision
/sp.adr "Why we chose cron syntax over natural language for recurrence"

# 10. Commit
/sp.git.commit_pr

# 11. Record process
/sp.phr
```

---

## Failure Modes to Avoid

### Anti-Pattern 1: Creative Implementation

❌ **BAD**:
```
User: "Add a delete button"
Agent: "I'll add a delete button with undo functionality,
       confirmation dialog with custom animations,
       and bulk delete support!"
```

✅ **GOOD**:
```
User: "Add a delete button"
Agent: "I need a specification for the delete button.
       Should I create one, or does one exist?

       Questions to clarify:
       - Confirmation dialog required?
       - Single delete only, or bulk delete?
       - Soft delete or hard delete?
       - What happens to related data?"
```

### Anti-Pattern 2: Spec Violations

❌ **BAD** (Spec says "use JWT auth"):
```typescript
// Agent implements Basic Auth instead
const auth = btoa(`${username}:${password}`);
```

✅ **GOOD**:
```typescript
// Agent implements exactly what spec requires
const token = localStorage.getItem('jwt_token');
headers: { Authorization: `Bearer ${token}` }
```

### Anti-Pattern 3: Skipping Documentation

❌ **BAD**:
```
Agent: "Done! I've implemented the feature."
[No PHR, no ADR, no updated specs]
```

✅ **GOOD**:
```
Agent: "Implementation complete. Now I'll:
1. Create PHR documenting this exchange
2. Update CLAUDE.md with new patterns
3. Create ADR for the state management choice
4. Update README with the new feature"
```

---

## Project-Specific Patterns

### Authentication Pattern (CRITICAL)

```typescript
// ❌ WRONG - User ID in URL (security vulnerability)
GET /api/123/tasks

// ✅ CORRECT - JWT-based auth
GET /api/tasks
Headers: { Authorization: 'Bearer <jwt_token>' }

// Backend extracts user_id FROM TOKEN, not URL
```

**Rationale**: See Constitution Principle VII - prevents users from accessing other users' data by manipulating URLs.

### Error Handling Pattern

```typescript
// ✅ ALWAYS include:
try {
  await apiCall();
} catch (error) {
  // 1. Log error
  console.error('Operation failed:', error);

  // 2. User-friendly message
  toast.error('Failed to save task. Please try again.');

  // 3. Cleanup/revert optimistic updates
  setTasks(previousTasks);
}
```

### API Response Pattern

```python
# ✅ ALWAYS return consistent structure
{
  "data": {...},           # Success payload
  "error": null            # Or error details
}

# OR for errors:
{
  "data": null,
  "error": {
    "message": "User-friendly message",
    "code": "VALIDATION_ERROR",
    "details": {...}
  }
}
```

---

## Technology Constraints

### Phase II Stack (MUST USE)

**Frontend**:
- Next.js 16 (App Router ONLY)
- React 19
- TypeScript 5+
- TailwindCSS 4
- Better Auth v1.4.7

**Backend**:
- Python 3.13+
- FastAPI 0.110+
- SQLModel (NOT SQLAlchemy directly)
- Neon PostgreSQL

**DO NOT**:
- Use Pages Router (deprecated)
- Use JavaScript instead of TypeScript
- Use CSS-in-JS libraries (use Tailwind)
- Use different auth libraries (Better Auth only)
- Use other ORMs (SQLModel only)

---

## File Organization Rules

### Naming Conventions

```
✅ CORRECT:
specs/005-quick-wins-ux/spec.md
specs/005-quick-wins-ux/plan.md
specs/005-quick-wins-ux/tasks.md

✅ ALSO CORRECT:
specs/005-quick-wins-ux/speckit.specify
specs/005-quick-wins-ux/speckit.plan
specs/005-quick-wins-ux/speckit.tasks

❌ WRONG:
specs/quick-wins.md          # No feature number
specs/005-spec.md            # No feature name
specs/feature-5/readme.md    # Wrong file names
```

### Directory Structure (MANDATORY)

```
hackathon-2/
├── AGENTS.md                    # This file
├── CLAUDE.md                    # Shim to AGENTS.md
├── constitution.md              # Phase II principles
├── .specify/                    # SpecKit Plus
│   ├── memory/constitution.md   # Phase I principles
│   └── templates/               # Spec templates
├── specs/                       # All feature specs
│   └── 00X-feature-name/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       └── checklists/
└── phase-2-web/
    ├── frontend/
    │   └── CLAUDE.md            # Frontend patterns
    └── backend/
        └── CLAUDE.md            # Backend patterns
```

---

## Task ID Referencing

### Format

```
Task IDs: T001, T002, T003, ...
User Story: US1, US2, US3, ...
```

### Usage in Code Comments

```typescript
// ✅ GOOD - Traceability
// [T042] [US3] Implement drag-and-drop reordering
// Acceptance Criteria: AC-3.2 - Tasks persist order after drag
const handleDragEnd = (result) => {
  // Implementation linked to task T042
};

// ❌ BAD - No traceability
// TODO: Make this draggable
const handleDragEnd = (result) => {
  // Mystery implementation
};
```

### In Commit Messages

```bash
✅ GOOD:
git commit -m "[T042] [US3] Implement drag-and-drop task reordering

- Add @dnd-kit/core and @dnd-kit/sortable
- Create DraggableTaskItem wrapper component
- Add sort_order field to Task model
- Implement backend /api/tasks/reorder endpoint

Satisfies AC-3.1, AC-3.2, AC-3.3 from spec.md"

❌ BAD:
git commit -m "Add drag and drop"
```

---

## Quality Gates

### Before ANY Code Generation

- [ ] Constitution read and understood
- [ ] Spec exists for this feature (spec.md)
- [ ] Plan exists (plan.md)
- [ ] Tasks broken down (tasks.md)
- [ ] Current task ID identified
- [ ] Acceptance criteria for task reviewed

### After Code Generation

- [ ] Code satisfies ONLY the current task
- [ ] No additional features added
- [ ] All acceptance criteria met
- [ ] TypeScript compiles (frontend)
- [ ] Python type checks pass (backend)
- [ ] Tests written/updated
- [ ] PHR created documenting process

### Before Commit

- [ ] All tests pass
- [ ] No console errors
- [ ] ESLint/Prettier passes (frontend)
- [ ] PEP 8 compliant (backend)
- [ ] Commit message references task ID
- [ ] Git commit uses spec-driven workflow

---

## Integration with MCP Server

### SpecKit Plus MCP Exposes

The `.specify/commands/*.md` files are exposed as MCP prompts:

```
MCP Tools Available:
- sp.specify (from .specify/commands/sp.specify.md)
- sp.plan (from .specify/commands/sp.plan.md)
- sp.tasks (from .specify/commands/sp.tasks.md)
- sp.implement (from .specify/commands/sp.implement.md)
- sp.clarify (from .specify/commands/sp.clarify.md)
- sp.analyze (from .specify/commands/sp.analyze.md)
- sp.adr (from .specify/commands/sp.adr.md)
- sp.git.commit_pr (from .specify/commands/sp.git.commit_pr.md)
- sp.phr (from .specify/commands/sp.phr.md)
```

**Cross-IDE Compatibility**: These commands work in:
- VS Code (with Claude Dev extension)
- JetBrains IDEs (with MCP plugin)
- Cursor (native MCP support)
- Any MCP-compatible editor

---

## Evaluation Criteria Reminder

**The hackathon judges will evaluate**:

1. **Process Quality (40%)**:
   - Quality of prompts and specifications
   - Iteration and refinement process
   - PHR completeness and clarity
   - Adherence to spec-driven workflow

2. **Code Quality (30%)**:
   - Type safety and clean code
   - Architecture alignment with specs
   - Security best practices
   - Error handling and edge cases

3. **Feature Completeness (20%)**:
   - Core features fully implemented
   - Intermediate features functional
   - Advanced features (bonus)
   - User experience polish

4. **Documentation (10%)**:
   - README clarity
   - Spec organization
   - Process transparency
   - AGENTS.md completeness

**Process is MORE important than final code.**

---

## Emergency Override

**Only when absolutely necessary** (e.g., production outage, critical security fix):

1. Document the emergency in ADR
2. Make minimal fix
3. Create retroactive spec documenting the change
4. Add to technical debt backlog
5. Schedule proper spec-driven refactor

**This should be RARE (<1% of changes).**

---

## Summary for Agents

### When You Join This Project

1. Read `AGENTS.md` (this file) FIRST
2. Read `/phase-2-web/constitution.md` SECOND
3. Read appropriate `CLAUDE.md` (frontend or backend) THIRD
4. Check `/specs/` for existing features FOURTH
5. ONLY THEN start working

### For Every Task

1. Identify the task ID (e.g., T042)
2. Read the acceptance criteria for that task
3. Implement ONLY what's specified
4. Test against acceptance criteria
5. Create PHR documenting the exchange

### Your Mantra

> "Spec first, code second. Traceability always. Process matters."

---

**End of AGENTS.md**

This document is the source of truth for ALL agents working on Hackathon II.
