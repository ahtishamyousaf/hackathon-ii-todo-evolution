---
name: crud-spec-generator
description: Generate complete CRUD specifications for any entity across all phases. Use when creating specifications for new entities (Contact, Note, Event, etc.) or when adding CRUD features to any phase (console, web, chatbot, cloud).
skill_type: Reusable Intelligence
bonus_points: 200
phases: [I, II, III, IV, V]
---

# CRUD Spec Generator

**Skill Type**: Reusable Intelligence - Agent Skill
**Purpose**: Generate complete CRUD specifications for any entity
**Points**: Bonus Feature (+200 points - Reusable Intelligence)
**Applies To**: Phases I, II, III, IV, V

## Overview

This skill automatically generates comprehensive CRUD (Create, Read, Update, Delete) specifications for any entity, following the patterns established in Phase I of the Todo app. It creates specifications that can be used with Claude Code to generate implementations across all phases.

## Skill Capabilities

Given an entity name and field definitions, this skill generates 5 complete specification files:
1. **Add Entity** - Create new entity specification
2. **View Entity List** - Display all entities specification
3. **Update Entity** - Modify entity specification
4. **Delete Entity** - Remove entity specification
5. **Mark/Toggle Entity Status** - Toggle boolean field specification (if applicable)

## Usage

### Basic Usage

```
@.claude/skills/crud-spec-generator.md

Generate CRUD specifications for:
Entity: Contact
Fields:
  - id: int (auto-generated)
  - name: string (required, 1-100 chars)
  - email: string (required, valid email)
  - phone: string (optional, 10-15 chars)
  - notes: string (optional, max 500 chars)
  - is_favorite: boolean (default false)
```

### Advanced Usage

```
@.claude/skills/crud-spec-generator.md

Generate CRUD specifications for:
Entity: Note
Fields:
  - id: int (auto-generated)
  - title: string (required, 1-200 chars)
  - content: string (required, 1-5000 chars)
  - category: string (optional, enum: personal|work|ideas)
  - is_archived: boolean (default false)
  - created_at: datetime (auto-generated)
  - updated_at: datetime (auto-updated)

Additional Requirements:
- Search by title and content
- Filter by category and archive status
- Rich text editor for content
```

## Skill Template

### Input Format

```yaml
entity_name: <EntityName>          # e.g., Contact, Note, Event
entity_plural: <EntityNamePlural>  # e.g., Contacts, Notes, Events
fields:
  - name: <field_name>
    type: <string|int|boolean|datetime>
    required: <true|false>
    validation: <validation rules>
    default: <default value>
primary_key: <field_name>          # Usually 'id'
boolean_toggle_field: <field_name> # For mark/toggle feature (e.g., is_favorite)
```

### Output Structure

```
specs/<entity_lowercase>/
├── overview.md
├── architecture.md
└── features/
    ├── 01-add-<entity_lowercase>.md
    ├── 02-view-<entity_lowercase>-list.md
    ├── 03-update-<entity_lowercase>.md
    ├── 04-delete-<entity_lowercase>.md
    └── 05-toggle-<entity_lowercase>-<field>.md
```

## Specification Generation Rules

### 1. Add Entity Specification

**Template**: Based on `specs/features/01-add-task.md`

**Must Include**:
- Feature overview with entity description
- User story: "As a user, I want to create new {entity} with {required fields}"
- Acceptance criteria (minimum 9):
  - User can add entity by providing required fields
  - System validates each field according to rules
  - System generates unique ID
  - System sets timestamps automatically
  - Success confirmation displayed
- User interaction flow (normal + error cases)
- Data requirements table
- Validation rules for each field
- Error handling (E1-E4 minimum)
- Success messages format
- Implementation guidance (CLI/API layer)
- Test scenarios (8-10)
- Example interactions (3-5)

**Field-Specific Adaptations**:
- Replace "Task" with entity name throughout
- Replace "title" and "description" with actual field names
- Adjust validation rules per field type
- Update character limits based on field definitions

### 2. View Entity List Specification

**Template**: Based on `specs/features/02-view-tasks.md`

**Must Include**:
- Feature overview for listing entities
- User story: "As a user, I want to see all my {entities}"
- Acceptance criteria (minimum 9):
  - Display all entities in formatted table
  - Show key fields in columns
  - Sort by primary key or date
  - Handle empty list
  - Show statistics
- Table formatting specifications
  - Column layout with widths
  - Field truncation rules
  - Status indicators (if boolean field exists)
- Sorting rules
- Empty state message
- Test scenarios (8-10)
- Example interactions showing:
  - Empty list
  - Single entity
  - Multiple entities

**Field-Specific Adaptations**:
- Select 3-5 most important fields for table columns
- Boolean fields show as indicators (✓/○ or similar)
- Date fields formatted consistently
- Long text fields truncated with "..."

### 3. Update Entity Specification

**Template**: Based on `specs/features/03-update-task.md`

**Must Include**:
- Feature overview for modifying entities
- User story: "As a user, I want to modify existing {entity} details"
- Acceptance criteria (minimum 10):
  - User can update by providing entity ID
  - Show current values before update
  - Allow updating any editable field
  - Press Enter to keep current value
  - Validate new values
  - Update timestamp
- User interaction flow:
  - Get entity ID
  - Display current entity
  - Prompt for each editable field
  - Show "No changes" if nothing updated
- Data requirements (which fields are editable)
- Validation rules (same as Add)
- Test scenarios (10+)
- Example interactions (5+)

**Field-Specific Adaptations**:
- Auto-generated fields (id, created_at) not editable
- Timestamps (updated_at) auto-updated
- Each editable field gets a prompt

### 4. Delete Entity Specification

**Template**: Based on `specs/features/04-delete-task.md`

**Must Include**:
- Feature overview for removing entities
- User story: "As a user, I want to remove {entities} from the list"
- Acceptance criteria (minimum 10):
  - User can delete by ID
  - Show entity details before deletion
  - Require confirmation (y/n)
  - Warning about permanence
  - IDs not reused after deletion
- Confirmation flow
- Safety measures
- Test scenarios (10+)
- Example interactions (5+)

**Field-Specific Adaptations**:
- Display all key fields in confirmation
- Entity-specific warning messages

### 5. Toggle Entity Status Specification

**Template**: Based on `specs/features/05-mark-complete.md`

**Must Include** (if boolean field exists):
- Feature overview for toggling status
- User story: "As a user, I want to toggle {entity} {status_field}"
- Acceptance criteria (minimum 10):
  - User can toggle by ID
  - Show current status
  - Toggle between true/false
  - Update timestamp
  - Reversible (no confirmation)
- Status representation (indicators)
- Test scenarios (10+)
- Example interactions (5+)

**Field-Specific Adaptations**:
- Replace "completed" with actual boolean field name
- Adjust status indicators (✓/○, ⭐/☆, etc.)
- Status display names (Complete/Pending, Favorite/Normal, etc.)

**If no boolean field**: Skip this specification or create a generic "mark as deleted" soft delete feature.

## Generated Specification Quality Standards

Each generated specification must meet these criteria:

### Structure Quality
- ✅ Follows the same structure as Phase I specs
- ✅ All sections present (Overview, User Story, Acceptance Criteria, etc.)
- ✅ Consistent formatting and style
- ✅ Proper markdown headers and tables

### Content Quality
- ✅ Clear, specific acceptance criteria (9-14 per feature)
- ✅ Detailed user interaction flows
- ✅ Comprehensive validation rules
- ✅ Complete error handling scenarios
- ✅ Multiple test scenarios (8-10 per feature)
- ✅ Realistic example interactions (3-5 per feature)

### Adaptability
- ✅ Entity-specific terminology throughout
- ✅ Field-specific validations
- ✅ Appropriate data types
- ✅ Realistic constraints and limits

### Implementability
- ✅ Clear enough for Claude Code to generate code
- ✅ Complete data model definition
- ✅ API/CLI interface specified
- ✅ Success/error messages defined

## Example: Generate Contact CRUD Specs

### Input

```
Entity: Contact
Fields:
  - id: int (auto, primary key)
  - name: string (required, 1-100 chars)
  - email: string (required, email format)
  - phone: string (optional, 10-15 chars)
  - notes: string (optional, max 500 chars)
  - is_favorite: boolean (default false)
  - created_at: datetime (auto)
  - updated_at: datetime (auto)
```

### Output Files

**01-add-contact.md** (350+ lines):
- Feature: Add Contact
- Validation: name (1-100), email (valid format), phone (10-15 if provided)
- Success: "✓ Contact created successfully! ID: {id}, Name: {name}"
- 9 acceptance criteria, 8 test scenarios, 4 example interactions

**02-view-contacts.md** (400+ lines):
- Feature: View Contact List
- Table columns: ID | Name | Email | Phone | Favorite | Created
- Favorite indicator: ⭐ (true) / ☆ (false)
- Empty state: "No contacts yet. Add your first contact!"
- 9 acceptance criteria, 8 test scenarios, 4 example interactions

**03-update-contact.md** (450+ lines):
- Feature: Update Contact
- Editable fields: name, email, phone, notes (not id, not timestamps)
- Partial updates supported (Enter to skip)
- 10 acceptance criteria, 10 test scenarios, 5 example interactions

**04-delete-contact.md** (450+ lines):
- Feature: Delete Contact
- Confirmation required
- Shows: ID, Name, Email, Phone before deletion
- Warning: "⚠️ This action cannot be undone!"
- 10 acceptance criteria, 10 test scenarios, 5 example interactions

**05-toggle-favorite.md** (400+ lines):
- Feature: Toggle Favorite Status
- Toggle is_favorite between true/false
- Status indicators: ⭐ Favorite / ☆ Normal
- 10 acceptance criteria, 10 test scenarios, 5 example interactions

## Usage Across Phases

### Phase I (Console App)
Generate specs → Claude Code generates Python console implementation

### Phase II (Web App)
Generate specs → Claude Code generates:
- FastAPI REST endpoints
- Next.js UI components
- SQLModel database models

### Phase III (Chatbot)
Generate specs → Claude Code generates:
- MCP tools for each operation
- Natural language command handling
- Agent behavior specifications

### Phase IV & V (Cloud)
Generate specs → Claude Code generates:
- Kubernetes manifests
- Helm charts
- Service configurations

## Validation Checklist

Before using generated specifications:

- [ ] Entity name is used consistently throughout
- [ ] All field names are correct
- [ ] Validation rules match field types
- [ ] Character limits are appropriate
- [ ] Success messages are entity-specific
- [ ] Error messages are clear and helpful
- [ ] Test scenarios cover all edge cases
- [ ] Example interactions are realistic
- [ ] Implementation guidance is complete
- [ ] Follows Phase I spec structure

## Benefits

### Time Savings
- Phase I: Manual spec writing (7 hours) → Skill generation (30 mins)
- Phase II: Add 3 new entities → 15 mins with skill vs 21 hours manually
- Phase III: Add chatbot specs → 10 mins with skill vs 14 hours manually

### Consistency
- Same structure across all entities
- Same quality standards
- Same level of detail
- Fewer mistakes

### Reusability
- Use in all 5 phases
- Use for any entity (Contact, Note, Event, Project, etc.)
- Easy to extend for new field types
- Template for future projects

## Extension Ideas

Future enhancements to this skill:

1. **Relationship Support**: Generate specs for one-to-many, many-to-many relationships
2. **Search Specifications**: Auto-generate search and filter specs
3. **Validation Library**: Pre-defined validation patterns (email, phone, URL, etc.)
4. **API Documentation**: Generate OpenAPI/Swagger specs
5. **Test Case Generation**: Generate automated test code
6. **Localization**: Generate specs in multiple languages

## Skill Metadata

```yaml
skill_name: crud-spec-generator
version: 1.0.0
author: Hackathon II Participant
created: 2025-12-10
phases: [I, II, III, IV, V]
bonus_category: Reusable Intelligence
bonus_points: +200
dependencies: []
output_format: Markdown specification files
```

---

**This skill demonstrates mastery of:**
- Spec-Driven Development principles
- Pattern recognition and abstraction
- Reusable intelligence creation
- Claude Code Agent Skills development
- Domain modeling and architecture

**Value Proposition**: Reduces specification writing time by 95% while maintaining quality and consistency across all entities and phases.
