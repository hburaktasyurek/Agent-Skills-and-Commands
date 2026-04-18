---
name: create-subagent
description: >-
  Create custom subagents for specialized AI tasks. Use when you want to create
  a new type of subagent, set up task-specific agents, configure code reviewers,
  debuggers, or domain-specific assistants with custom prompts.
disable-model-invocation: true
---
# Creating Custom Subagents

Subagents are specialized AI assistants that run in isolated contexts with custom system prompts.

## Subagent Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `.cursor/agents/` | Current project | Higher |
| `~/.cursor/agents/` | All your projects | Lower |

**Project subagents** (`.cursor/agents/`): For codebase-specific agents. Check into version control to share with your team.

**User subagents** (`~/.cursor/agents/`): Personal agents available across all your projects.

## Subagent File Format

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

### Required Fields

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (lowercase letters and hyphens only) |
| `description` | When to delegate to this subagent (be specific!) |

## Writing Effective Descriptions

```yaml
# ❌ Too vague
description: Helps with code

# ✅ Specific and actionable
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability. Use immediately after writing or modifying code.
```

Include "use proactively" to encourage automatic delegation.

## Subagent Creation Workflow

1. **Decide scope**: Project (`.cursor/agents/`) or user (`~/.cursor/agents/`)
2. **Create the file** with required frontmatter
3. **Write the system prompt** — be specific about workflow, output format, constraints
4. **Test** by asking the AI to use your new agent

## Best Practices

1. Design focused subagents — each should excel at one specific task
2. Write detailed descriptions with trigger terms
3. Check project subagents into version control
4. Use proactive language in descriptions

## Troubleshooting

### Subagent Not Found
- Ensure file is in `.cursor/agents/` or `~/.cursor/agents/`
- Check file has `.md` extension
- Verify YAML frontmatter syntax is valid
