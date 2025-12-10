# Todo Console App - Phase I Overview

## Project Description

**Todo Console App** is Phase I of "The Evolution of Todo" - a five-phase hackathon project demonstrating spec-driven development mastery. This phase establishes the foundational todo list application as a Python console program with in-memory storage.

### Purpose
- Demonstrate spec-driven development using Claude Code
- Build a clean, extensible architecture that evolves across 5 phases
- Master the workflow: specifications → AI-generated code → validation → refinement
- Create a working todo application with core CRUD functionality

### Vision
This console app is the first step in an evolutionary journey:
- **Phase I** (Current): Console app with in-memory storage
- **Phase II**: Web application with database persistence (Next.js + FastAPI + Neon)
- **Phase III**: Natural language chatbot interface (OpenAI Agents + MCP)
- **Phase IV**: Containerized Kubernetes deployment (Docker + Helm + Minikube)
- **Phase V**: Cloud-native with event-driven architecture (DOKS + Kafka + Dapr)

## Phase I Scope

### What We're Building
A Python command-line application that allows users to manage their todo list through a text-based menu interface. All data is stored in memory and persists only during the application session.

### In Scope
✅ **Interface**: Console-based menu with numbered options
✅ **Storage**: In-memory (Python data structures)
✅ **Features**: 5 basic CRUD operations
✅ **Data Model**: Task with id, title, description, status, timestamps
✅ **Error Handling**: Comprehensive validation and helpful error messages
✅ **User Experience**: Clear prompts, formatted output, status indicators
✅ **Code Quality**: Type hints, PEP 8, clean architecture
✅ **Documentation**: README, CLAUDE.md, detailed specifications

### Out of Scope
❌ **No Database**: No file or database persistence (Phase II)
❌ **No Web UI**: No browser interface or HTTP API (Phase II)
❌ **No AI Features**: No chatbot or natural language processing (Phase III)
❌ **No Containerization**: No Docker or Kubernetes (Phase IV)
❌ **No Cloud Deployment**: No cloud hosting or event streaming (Phase V)
❌ **No Advanced Features**: No priorities, tags, search, recurring tasks, reminders (Phase V)
❌ **No Authentication**: Single-user, no login system (Phase II)

### Why These Boundaries?
Each phase builds on the previous one. Phase I focuses on:
- Establishing clean architecture patterns
- Mastering spec-driven development workflow
- Creating reusable business logic for future phases
- Demonstrating code quality and attention to detail

## Technology Stack

### Core Technologies
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Language | Python | 3.13+ | Primary development language |
| Package Manager | UV | Latest | Fast, modern dependency management |
| Data Structures | Built-in | - | list, dict for in-memory storage |
| Data Model | dataclass | - | Type-safe Task entity |
| Interface | CLI | - | stdin/stdout text interaction |

### Development Tools
| Tool | Purpose |
|------|---------|
| Claude Code | AI-powered code generation from specifications |
| SpecKit Plus | Specification framework and templates |
| Git | Version control |
| GitHub | Code hosting and submission |

### Why This Stack?
- **Python 3.13+**: Modern Python with latest features, type hints, performance improvements
- **UV**: Faster than pip, better dependency resolution, modern project structure
- **In-Memory Storage**: Simplest possible persistence for Phase I, easy to replace in Phase II
- **Dataclass**: Type-safe, clean data modeling, generates boilerplate automatically
- **CLI Interface**: Minimal dependencies, easy to test, focuses on business logic

## Feature Set

### The 5 Basic Features

#### 1. Add Task
**Purpose**: Create new todo items
**User Input**: Title (required), Description (optional)
**Output**: Task ID, confirmation message
**Stored Data**: ID, title, description, completed=False, timestamps

#### 2. View Task List
**Purpose**: Display all tasks in the todo list
**User Input**: None (displays all)
**Output**: Formatted table with ID, Title, Status, Created date
**Visual**: Status indicators (✓ Complete / ○ Pending)

#### 3. Update Task
**Purpose**: Modify existing task details
**User Input**: Task ID, new title and/or description
**Output**: Updated task details, confirmation message
**Validation**: Task ID must exist

#### 4. Delete Task
**Purpose**: Remove tasks from the list
**User Input**: Task ID
**Output**: Deletion confirmation
**Validation**: Task ID must exist

#### 5. Mark as Complete
**Purpose**: Toggle task completion status
**User Input**: Task ID
**Output**: New status (Complete/Pending), confirmation
**Behavior**: Can toggle back and forth between states

### Feature Completeness Criteria
Each feature must:
- ✅ Have a dedicated specification document
- ✅ Handle all error cases gracefully
- ✅ Provide clear user feedback
- ✅ Validate all inputs
- ✅ Work correctly with in-memory storage
- ✅ Follow the UI/UX standards in constitution.md

## Data Model

### Task Entity
```python
@dataclass
class Task:
    id: int                    # Auto-generated, sequential, unique
    title: str                 # Required, min 1 char, max 200 chars
    description: str           # Optional, max 1000 chars, can be empty
    completed: bool            # Default False, toggleable
    created_at: datetime       # Auto-set on creation, immutable
    updated_at: datetime       # Auto-set on creation, updated on modification
```

### Storage Mechanism
- **Structure**: List of Task objects
- **ID Management**: Auto-incrementing counter, starts at 1
- **Persistence**: In-memory only, lost when app exits
- **Capacity**: Limited only by available RAM

## Success Criteria

### Minimum Viable (Pass)
- ✅ All 5 features work without errors
- ✅ Specifications exist for constitution, overview, architecture, and all 5 features
- ✅ Code generated entirely by Claude Code (no manual edits)
- ✅ Application runs without crashes
- ✅ Submitted on time (Dec 7, 2025)

### Good Quality (75-85 points)
- ✅ Above minimum criteria met
- ✅ Clear, detailed specifications
- ✅ Robust error handling with helpful messages
- ✅ Clean code structure following PEP 8
- ✅ Good documentation (README with setup/usage)

### Excellent Quality (85-95 points)
- ✅ Above good quality criteria met
- ✅ Exceptional specification quality (could serve as examples)
- ✅ Comprehensive input validation
- ✅ Professional documentation with examples
- ✅ Polished user experience with great formatting
- ✅ Great demo video (clear, concise, professional)

### Outstanding Quality (95-100 points)
- ✅ Above excellent criteria met
- ✅ Innovative specification organization
- ✅ Reusable patterns documented for future phases
- ✅ Teaching-quality documentation
- ✅ Exceptional demo video that tells a story
- ✅ Evidence of iterative spec refinement

## User Experience Flow

### Application Start
```
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

### Example Interaction - Add Task
```
Enter your choice (1-6): 1

--- Add New Task ---
Task title: Buy groceries
Task description (optional): Milk, eggs, bread, and coffee

✓ Task created successfully!
  ID: 1
  Title: Buy groceries
  Description: Milk, eggs, bread, and coffee
  Status: Pending

Press Enter to return to menu...
```

### Example Interaction - View Tasks
```
Enter your choice (1-6): 2

--- Your Tasks ---

ID  | Status    | Title                | Created
----|-----------|---------------------|-------------------
1   | ○ Pending | Buy groceries       | 2025-12-10 14:30
2   | ✓ Done    | Call dentist        | 2025-12-10 13:15
3   | ○ Pending | Finish homework     | 2025-12-10 15:45

Total: 3 tasks (1 completed, 2 pending)

Press Enter to return to menu...
```

## Project Constraints

### Technical Constraints
- Must use Python 3.13+ (or 3.12 minimum)
- Must use UV package manager
- No external database libraries
- No web frameworks
- Console interface only (no GUI)

### Process Constraints
- All code must be generated by Claude Code
- Manual code editing is prohibited
- Specifications must be written before code generation
- If code has issues, refine spec and regenerate (no direct fixes)

### Scope Constraints
- Exactly 5 features (no additional features)
- No intermediate or advanced todo features
- No persistence beyond current session
- Single-user only (no multi-user support)

## Quality Standards

### Code Quality
- Type hints on all functions
- PEP 8 compliance
- No magic numbers
- Clear variable/function names
- Separation of concerns (models, logic, UI)

### Documentation Quality
- README with setup instructions
- CLAUDE.md with generation instructions
- All specifications complete and clear
- Code comments for complex logic (if needed)

### User Experience Quality
- Clear, helpful error messages
- Consistent formatting
- Intuitive menu navigation
- Immediate feedback for actions
- No silent failures

## Risk Mitigation

### Risk: Specification Unclear
**Mitigation**: Use the spec templates, include examples, review before generation

### Risk: Generated Code Doesn't Work
**Mitigation**: Refine specification with more detail, add constraints, regenerate

### Risk: Feature Scope Creep
**Mitigation**: Refer to constitution.md boundaries, defer features to appropriate phases

### Risk: Time Overrun
**Mitigation**: Focus on minimum viable first, enhance specifications iteratively

## Success Metrics

### Functional Metrics
- 5/5 features working correctly
- 0 crashes or unhandled exceptions
- 100% of inputs validated
- All error cases handled

### Quality Metrics
- 8/8 specification documents complete
- 100% PEP 8 compliance
- Type hints on 100% of functions
- Separation of concerns achieved

### Documentation Metrics
- README includes setup, usage, examples
- CLAUDE.md clear and actionable
- All specs have acceptance criteria
- Demo video under 90 seconds

## Next Steps After Overview

1. **Architecture Specification** (specs/architecture.md)
   - Component diagram
   - Data flow design
   - Module responsibilities
   - Error handling strategy

2. **Feature Specifications** (specs/features/*.md)
   - 01-add-task.md
   - 02-view-tasks.md
   - 03-update-task.md
   - 04-delete-task.md
   - 05-mark-complete.md

3. **Code Generation** (via Claude Code)
   - Use specifications to generate implementation
   - Test generated code
   - Refine specs if needed

4. **Documentation** (README.md, CLAUDE.md)
   - Setup instructions
   - Usage guide
   - Development workflow

5. **Demo & Submission**
   - Record 90-second demo video
   - Push to GitHub
   - Submit via Google Form

---

**Document Version**: 1.0.0
**Last Updated**: 2025-12-10
**Phase**: I - Console Application
**Status**: Specification Complete
**Next**: Architecture Specification
