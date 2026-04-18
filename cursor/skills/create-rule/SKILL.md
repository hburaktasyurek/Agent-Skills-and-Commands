---
name: create-rule
description: >-
  Create Cursor rules for persistent AI guidance. Use when you want to create a
  rule, add coding standards, set up project conventions, configure
  file-specific patterns, create RULE.md files, or asks about .cursor/rules/.
---
# Creating Cursor Rules

Create project rules in `.cursor/rules/` to provide persistent context for the AI agent.

## Gather Requirements

Before creating a rule, determine:

1. **Purpose**: What should this rule enforce or teach?
2. **Scope**: Should it always apply, or only for specific files?
3. **File patterns**: If file-specific, which glob patterns?

### Inferring from Context

If you have previous conversation context, infer rules from what was discussed. You can create multiple rules if the conversation covers distinct topics or patterns.

### Required Questions

If the user hasn't specified scope, ask:
- "Should this rule always apply, or only when working with specific files?"

If they mentioned specific files, ask:
- "Which file patterns should this rule apply to?" (e.g., `**/*.ts`, `backend/**/*.py`)

Use the AskQuestion tool when available.

---

## Rule File Format

Rules are `.mdc` files in `.cursor/rules/`:

```markdown
---
description: Brief description of what this rule does
globs: **/*.ts  # File pattern for file-specific rules
alwaysApply: false  # Set to true if rule should always apply
---

# Rule Title

Your rule content here...
```

### Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | What the rule does (shown in rule picker) |
| `globs` | string | File pattern — rule applies when matching files are open |
| `alwaysApply` | boolean | If true, applies to every session |

---

## Rule Configurations

### Always Apply

```yaml
---
description: Core coding standards for the project
alwaysApply: true
---
```

### Apply to Specific Files

```yaml
---
description: TypeScript conventions for this project
globs: **/*.ts
alwaysApply: false
---
```

---

## Best Practices

- **Under 500 lines**: Rules should be concise
- **One concern per rule**: Split large rules into focused pieces
- **Concrete examples**: Show good vs bad patterns

---

## Checklist

- [ ] File is `.mdc` format in `.cursor/rules/`
- [ ] Frontmatter configured correctly
- [ ] Content under 500 lines
- [ ] Includes concrete examples
