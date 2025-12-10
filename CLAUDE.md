# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

---

# Phase I: Todo Console App - Implementation Instructions

## Project Context

**Project**: Todo Console App - Phase I
**Hackathon**: The Evolution of Todo - Hackathon II
**Phase**: I - Console Application (in-memory storage, 5 basic CRUD features)
**Due Date**: December 7, 2025

## Specifications Reference

All specifications are complete and ready for implementation:

### Foundation Documents
- **constitution.md** - Project principles, technical standards, governance
- **specs/overview.md** - Project overview, scope, tech stack, success criteria
- **specs/architecture.md** - Component design, data flow, module responsibilities

### Feature Specifications (All Complete)
- **specs/features/01-add-task.md** - Add Task feature (F001)
- **specs/features/02-view-tasks.md** - View Task List feature (F002)
- **specs/features/03-update-task.md** - Update Task feature (F003)
- **specs/features/04-delete-task.md** - Delete Task feature (F004)
- **specs/features/05-mark-complete.md** - Mark Complete feature (F005)

## Technology Stack

- **Language**: Python 3.12+ (3.13 preferred)
- **Package Manager**: UV (already initialized)
- **Storage**: In-memory (Python list)
- **Data Model**: dataclass
- **Interface**: CLI (console)
- **Dependencies**: None (standard library only)

## Project Structure

```
src/
├── __init__.py          # Package marker
├── main.py              # Entry point and main loop
├── models.py            # Task dataclass
├── task_manager.py      # TaskManager class (business logic)
└── cli.py               # CLI functions (user interaction)
```

## Implementation Approach

### Step 1: Generate Data Model (models.py)

**Reference**: `specs/architecture.md` (Data Model section)

**Prompt**:
```
@constitution.md @specs/architecture.md

Generate src/models.py with the Task dataclass:
- Use @dataclass decorator
- Fields: id (int), title (str), description (str), completed (bool), created_at (datetime), updated_at (datetime)
- Add type hints for all fields
- Implement __str__ method for display
- Follow PEP 8 style guide
```

**Acceptance**:
- Task dataclass with all 6 fields
- Type hints present
- `__str__` method for human-readable output

---

### Step 2: Generate Business Logic (task_manager.py)

**Reference**: `specs/architecture.md` (TaskManager Class section)

**Prompt**:
```
@constitution.md @specs/architecture.md

Generate src/task_manager.py with the TaskManager class:
- Private _tasks list and _next_id counter in __init__
- Implement 6 methods:
  * add_task(title: str, description: str = "") -> Task
  * get_all_tasks() -> List[Task]
  * get_task_by_id(task_id: int) -> Optional[Task]
  * update_task(task_id: int, title: str = None, description: str = None) -> Optional[Task]
  * delete_task(task_id: int) -> bool
  * toggle_complete(task_id: int) -> Optional[Task]
- All methods with type hints and docstrings
- Return None/False for failed operations (no exceptions)
- Update updated_at timestamp on modifications
```

**Acceptance**:
- TaskManager class with 6 methods
- Type hints on all methods
- Docstrings present
- Returns None/False for failures

---

### Step 3: Generate CLI - Add Task Handler

**Reference**: `specs/features/01-add-task.md`

**Prompt**:
```
@constitution.md @specs/features/01-add-task.md

Generate handle_add_task(manager: TaskManager) -> None in src/cli.py:
- Follow the user interaction flow in the spec
- Validate title (non-empty, max 200 chars)
- Validate description (optional, max 1000 chars)
- Display error messages and re-prompt on validation failure
- Show success message with task details
- Implement all error cases from the spec
```

**Acceptance**:
- Title validation works (empty, too long)
- Description validation works
- Error messages match spec
- Success message shows task details

---

### Step 4: Generate CLI - View Tasks Handler

**Reference**: `specs/features/02-view-tasks.md`

**Prompt**:
```
@constitution.md @specs/features/02-view-tasks.md

Generate in src/cli.py:
1. handle_view_tasks(manager: TaskManager) -> None
2. format_task_list(tasks: List[Task]) -> str

Requirements:
- Display table with columns: ID | Status | Title | Created
- Status indicators: ✓ Done / ○ Pending
- Truncate titles to 25 chars (first 22 + "...")
- Sort by ID ascending
- Show statistics: Total, completed, pending
- Handle empty list with friendly message
```

**Acceptance**:
- Table formatted correctly
- Status indicators display (✓/○)
- Title truncation works
- Empty list shows friendly message
- Statistics calculated correctly

---

### Step 5: Generate CLI - Update Task Handler

**Reference**: `specs/features/03-update-task.md`

**Prompt**:
```
@constitution.md @specs/features/03-update-task.md

Generate handle_update_task(manager: TaskManager) -> None in src/cli.py:
- Prompt for task ID, validate it exists
- Display current task details
- Prompt for new title (Enter to keep current)
- Prompt for new description (Enter to keep current)
- Validate new values if provided (same rules as add)
- Display "No changes made" if both fields skipped
- Show success with updated details
```

**Acceptance**:
- Can update title only
- Can update description only
- Can update both
- Enter keeps current value
- Displays "No changes" if both skipped

---

### Step 6: Generate CLI - Delete Task Handler

**Reference**: `specs/features/04-delete-task.md`

**Prompt**:
```
@constitution.md @specs/features/04-delete-task.md

Generate handle_delete_task(manager: TaskManager) -> None in src/cli.py:
- Prompt for task ID, validate it exists
- Display task details to be deleted
- Show warning: "⚠️ This action cannot be undone!"
- Ask for confirmation: "Are you sure? (y/n): "
- Accept y/yes (case-insensitive) as confirmation
- Anything else = cancel
- Display success or cancellation message
```

**Acceptance**:
- Shows task details before deletion
- Warning displayed
- y/yes/Y/YES all work
- n/no/anything else cancels
- Task actually deleted on confirmation

---

### Step 7: Generate CLI - Mark Complete Handler

**Reference**: `specs/features/05-mark-complete.md`

**Prompt**:
```
@constitution.md @specs/features/05-mark-complete.md

Generate handle_toggle_complete(manager: TaskManager) -> None in src/cli.py:
- Prompt for task ID, validate it exists
- Display current task details and status
- Toggle completed status (True ↔ False)
- Display: "Status changed: {old_status} → {new_status}"
- Show updated task details with new status
- No confirmation needed (toggle is reversible)
```

**Acceptance**:
- Pending → Complete works
- Complete → Pending works
- Status change message clear
- Can toggle multiple times

---

### Step 8: Generate CLI - Menu and Helper Functions

**Reference**: `specs/architecture.md` (CLI Layer section)

**Prompt**:
```
@constitution.md @specs/architecture.md

Generate in src/cli.py:
1. show_menu() -> None - Display main menu with 6 options
2. get_menu_choice() -> int - Get and validate user choice (1-6)
3. display_error(message: str) -> None - Show error with ❌ prefix
4. display_success(message: str) -> None - Show success with ✓ prefix

Menu format:
===================================
   Todo Console App - Phase I
===================================

Main Menu:
  1. Add new task
  2. View all tasks
  3. Update task
  4. Delete task
  5. Mark task as complete
  6. Exit

Enter your choice (1-6): _
```

**Acceptance**:
- Menu displays correctly
- Choice validation works (1-6)
- Error messages formatted with ❌
- Success messages formatted with ✓

---

### Step 9: Generate Main Entry Point (main.py)

**Reference**: `specs/architecture.md` (Main Entry Point section)

**Prompt**:
```
@constitution.md @specs/architecture.md

Generate src/main.py:
- main() function as entry point
- Create TaskManager instance
- Display welcome banner
- Main loop:
  * Call show_menu()
  * Get user choice
  * Route to handlers (1=add, 2=view, 3=update, 4=delete, 5=toggle, 6=exit)
  * Handle invalid choice
- Catch KeyboardInterrupt (Ctrl+C) for graceful exit
- Display goodbye message on exit
- if __name__ == "__main__": main()
```

**Acceptance**:
- Application starts correctly
- Menu loop works
- All 5 features accessible
- Exit option works
- Ctrl+C handled gracefully

---

## Code Quality Requirements

From `constitution.md`:

### Must Have:
- ✅ Type hints on all functions
- ✅ PEP 8 compliance
- ✅ Dataclasses for models
- ✅ Error handling on all inputs
- ✅ Input validation
- ✅ No hardcoded values
- ✅ Clean separation of concerns

### Architecture:
- **models.py**: Data definitions only
- **task_manager.py**: Business logic only, no I/O
- **cli.py**: I/O only, no business logic
- **main.py**: Orchestration only

## Testing Approach

Each feature specification includes:
- Acceptance criteria (9-14 per feature)
- Test scenarios (8-10 per feature)
- Example interactions

**Manual Testing Steps**:
1. Run: `uv run python src/main.py`
2. Test each feature following its spec's "Acceptance Validation" section
3. Verify all test scenarios pass
4. Try all example interactions
5. Test error cases

## Common Pitfalls to Avoid

❌ Don't implement business logic in CLI functions
✅ Call TaskManager methods from CLI handlers

❌ Don't raise exceptions for business failures
✅ Return None/False, let CLI display errors

❌ Don't skip input validation
✅ Validate all user inputs

❌ Don't hardcode strings/numbers
✅ Use clear variable names

## Validation Checklist

Before considering implementation complete:

### Code Quality:
- [ ] All functions have type hints
- [ ] PEP 8 compliant
- [ ] Uses dataclass for Task
- [ ] Proper separation of concerns
- [ ] All errors handled gracefully

### Functionality:
- [ ] All 5 features work
- [ ] Tasks persist during session
- [ ] IDs unique and sequential
- [ ] Timestamps update correctly
- [ ] No crashes on any input

### User Experience:
- [ ] Clear menu
- [ ] Helpful error messages
- [ ] Confirmation messages
- [ ] Well-formatted task list
- [ ] Status indicators (✓/○)

### Specifications:
- [ ] All acceptance criteria met
- [ ] All test scenarios pass
- [ ] Example interactions work

## Running the Application

```bash
# Run with UV
uv run python src/main.py

# Or activate venv first
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python src/main.py
```

## Success Criteria

Implementation is complete when:
1. ✅ All 5 features work without errors
2. ✅ All 67 acceptance criteria pass (across all features)
3. ✅ All 44 test scenarios pass
4. ✅ No crashes on any input
5. ✅ Code follows all quality standards

---

**Remember**: Specifications are the source of truth. Generate code from specs. If code has issues, refine the spec and regenerate - never edit code directly.
