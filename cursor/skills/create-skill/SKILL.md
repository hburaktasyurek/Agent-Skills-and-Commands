---
name: create-skill
description: >-
  Guides users through creating effective Agent Skills for Cursor. Use when you
  want to create, write, or author a new skill, or asks about skill structure,
  best practices, or SKILL.md format.
---
# Creating Skills in Cursor

Skills are markdown files that teach the agent how to perform specific tasks.

## Before You Begin: Gather Requirements

1. **Purpose and scope**: What specific task or workflow should this skill help with?
2. **Target location**: Personal skill (`~/.cursor/skills/`) or project skill (`.cursor/skills/`)?
3. **Trigger scenarios**: When should the agent automatically apply this skill?
4. **Key domain knowledge**: What specialized information does the agent need?
5. **Output format preferences**: Any specific templates, formats, or styles required?

**IMPORTANT**: Never create skills in `~/.cursor/skills-cursor/`. This directory is reserved for Cursor's internal built-in skills.

---

## Skill File Structure

```
skill-name/
├── SKILL.md              # Required - main instructions
├── reference.md          # Optional - detailed documentation
├── examples.md           # Optional - usage examples
└── scripts/              # Optional - utility scripts
```

### Storage Locations

| Type | Path | Scope |
|------|------|-------|
| Personal | `~/.cursor/skills/skill-name/` | All your projects |
| Project | `.cursor/skills/skill-name/` | Shared with the repo |

### SKILL.md Structure

```markdown
---
name: your-skill-name
description: Brief description of what this skill does and when to use it
---

# Your Skill Name

## Instructions
Clear, step-by-step guidance for the agent.
```

### Required Metadata Fields

| Field | Requirements |
|-------|--------------|
| `name` | Max 64 chars, lowercase letters/numbers/hyphens only |
| `description` | Max 1024 chars, non-empty. Includes WHAT and WHEN. |

---

## Writing Effective Descriptions

The description is **critical** for skill discovery.

1. **Write in third person**: "Processes Excel files" not "I can help you process"
2. **Be specific and include trigger terms**
3. **Include both WHAT and WHEN**

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

---

## Core Authoring Principles

### 1. Concise is Key

The context window is shared. Only add context the agent doesn't already have.

### 2. Keep SKILL.md Under 500 Lines

Use progressive disclosure for detailed content.

### 3. Progressive Disclosure

Put essential info in SKILL.md; detailed reference in separate files:

```markdown
## Additional resources
- For complete API details, see [reference.md](reference.md)
```

### 4. Set Appropriate Degrees of Freedom

| Freedom Level | When to Use |
|---------------|-------------|
| High (text instructions) | Multiple valid approaches |
| Medium (pseudocode/templates) | Preferred pattern with variation |
| Low (specific scripts) | Fragile operations, consistency critical |

---

## Anti-Patterns to Avoid

- Too many options — provide a default with an escape hatch
- Time-sensitive information — use "deprecated" sections instead
- Inconsistent terminology — pick one term, use it throughout
- Vague skill names (`helper`, `utils`) — use specific names (`analyzing-spreadsheets`)

---

## Summary Checklist

- [ ] Description is specific and includes WHAT and WHEN
- [ ] Written in third person
- [ ] SKILL.md is under 500 lines
- [ ] Consistent terminology throughout
- [ ] File references are one level deep
- [ ] No time-sensitive information
