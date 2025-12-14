---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
license: MIT License - https://github.com/anthropics/skills/blob/main/skills/skill-creator/LICENSE.txt
---

# Skill Creator

**Skills** are modular packages extending Claude's capabilities through specialized knowledge, workflows, and tool integrations. They function as "onboarding guides" for specific domains, transforming Claude into a specialized agent equipped with procedural expertise.

## What Skills Provide

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific file formats or APIs
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex tasks

## Core Principles

### Concise is Key

The context window is shared among system prompt, conversation history, other Skills' metadata, and user requests. Only include information Claude genuinely needs. Challenge each detail's necessity.

### Set Appropriate Degrees of Freedom

- **High freedom (text-based):** Multiple valid approaches; decisions depend on context
- **Medium freedom (pseudocode/scripts):** Preferred patterns exist; some variation acceptable
- **Low freedom (specific scripts):** Operations are fragile; consistency critical

## Skill Anatomy

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/
    ├── references/
    └── assets/
```

### SKILL.md (Required)

Contains frontmatter with `name` and `description` (determines when skill triggers), plus markdown instructions.

**Frontmatter format:**
```yaml
---
name: skill-name
description: Clear description of what the skill does and when to use it
---
```

### Bundled Resources (Optional)

- **Scripts (`scripts/`):** Executable code for deterministic reliability or repeatedly rewritten tasks
- **References (`references/`):** Documentation loaded as needed to inform Claude's process
- **Assets (`assets/`):** Files used in output (templates, icons, fonts, boilerplate)

## Progressive Disclosure Design

Three-level loading system manages context:

1. **Metadata (name + description)** - Always loaded
2. **SKILL.md body** - When skill triggers
3. **Bundled resources** - As needed

**Best practices:**
- Keep SKILL.md under 500 lines
- Use high-level guide with references
- Domain-specific organization
- Conditional details with linked advanced content
- Avoid deeply nested references; keep all reference files one level deep from SKILL.md

## Skill Creation Process

### Step 1: Understanding with Concrete Examples

Gather specific use cases and validate understanding of required functionality through examples.

**Questions to ask:**
- What specific tasks will this skill help with?
- What are 2-3 concrete examples of using this skill?
- What makes this skill different from general Claude capabilities?

### Step 2: Planning Reusable Contents

Analyze each example to identify helpful scripts, references, and assets for repeated execution.

**Identify:**
- Repetitive code patterns → Scripts
- Domain knowledge → References
- Template files → Assets

### Step 3: Initializing the Skill

Create the skill directory structure:

```bash
mkdir -p .claude/skills/skill-name
touch .claude/skills/skill-name/SKILL.md
```

For skills with bundled resources:
```bash
mkdir -p .claude/skills/skill-name/{scripts,references,assets}
```

### Step 4: Editing the Skill

1. **Implement scripts** (test by running them)
2. **Create references** with domain-specific guidance
3. **Prepare assets** for output use
4. **Update SKILL.md** with imperative language
5. **Write comprehensive frontmatter description** including "when to use" context

**SKILL.md writing tips:**
- Use imperative language ("Do this", "Check that", "Ensure X")
- Provide clear examples where helpful
- Link to bundled resources when needed
- Keep instructions focused and actionable

**Description field tips:**
- Be specific about when to trigger the skill
- Include key domain terms that might appear in user requests
- Describe what makes this skill unique
- Keep it under 200 characters if possible

### Step 5: Testing

Test the skill on real tasks:
1. Trigger the skill with realistic user requests
2. Verify Claude loads the correct resources
3. Confirm outputs match expectations
4. Check that skill doesn't interfere with other tasks

### Step 6: Iteration

Continuously improve:
1. Test on real tasks
2. Identify improvements
3. Update SKILL.md or bundled resources
4. Retest

## What NOT to Include

Do not create auxiliary documentation files:
- ❌ README.md
- ❌ INSTALLATION_GUIDE.md
- ❌ CHANGELOG.md
- ❌ CONTRIBUTING.md

Include only essential files directly supporting functionality.

## Examples of Good Skills

### High Freedom (Text-based)

```markdown
---
name: api-design
description: Guide for designing RESTful APIs following best practices
---

# API Design Principles

1. Use resource-based URLs
2. Leverage HTTP methods correctly
3. Return appropriate status codes
4. Version your APIs
...
```

### Medium Freedom (Pseudocode)

```markdown
---
name: react-component
description: Template for creating React components with TypeScript and best practices
---

# React Component Creation

When creating a new React component:

1. Create component file in appropriate directory
2. Use functional components with TypeScript
3. Extract props interface
4. Add proper JSDoc comments
...
```

### Low Freedom (Specific Scripts)

```markdown
---
name: database-migration
description: Create and run database migrations using Alembic
---

# Database Migration Workflow

To create a new migration:

1. Run script: `scripts/create_migration.sh <migration_name>`
2. Edit generated file in `migrations/versions/`
3. Review changes
4. Run script: `scripts/apply_migration.sh`
...
```

## Skill Maintenance

Update skills when:
- Domain knowledge changes
- Tools/APIs get updated
- User feedback reveals gaps
- Better patterns emerge

Keep skills focused. If scope expands significantly, consider splitting into multiple skills.

## Best Practices Summary

✅ **DO:**
- Keep SKILL.md concise (< 500 lines)
- Use clear, imperative language
- Provide concrete examples
- Test thoroughly before deploying
- Include "when to use" in description
- Link to bundled resources when needed

❌ **DON'T:**
- Include unnecessary documentation files
- Nest references deeply
- Duplicate general Claude knowledge
- Make descriptions too vague
- Forget to update when domain changes

---

**Remember:** Skills are onboarding guides, not encyclopedias. Focus on what Claude needs to know to perform the task, not everything about the domain.
