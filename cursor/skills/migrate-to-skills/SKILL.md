---
name: migrate-to-skills
description: >-
  Convert 'Applied intelligently' Cursor rules (.cursor/rules/*.mdc) and slash
  commands (.cursor/commands/*.md) to Agent Skills format (.cursor/skills/). Use
  when you want to migrate rules or commands to skills, or consolidate commands
  into the skills directory.
disable-model-invocation: true
---
# Migrate Rules and Slash Commands to Skills

Convert Cursor rules ("Applied intelligently") and slash commands to Agent Skills format.

**CRITICAL: Preserve the exact body content. Do not modify, reformat, or "improve" it - copy verbatim.**

## What to Migrate

**Rules**: Migrate if rule has a `description` but NO `globs` and NO `alwaysApply: true`.

**Commands**: Migrate all — they're plain markdown without frontmatter.

## Locations

| Level | Source | Destination |
|-------|--------|-------------|
| Project | `.cursor/rules/*.mdc`, `.cursor/commands/*.md` | `.cursor/skills/` |
| User | `~/.cursor/commands/*.md` | `~/.cursor/skills/` |

Notes:
- Cursor rules can live in nested directories — search recursively
- Ignore anything in `~/.cursor/worktrees`
- Ignore anything in `~/.cursor/skills-cursor` (Cursor's internal built-ins)

## Conversion Format

### Rules: .mdc → SKILL.md

```markdown
# Before: .cursor/rules/my-rule.mdc
---
description: What this rule does
globs:
alwaysApply: false
---
Body content...
```

```markdown
# After: .cursor/skills/my-rule/SKILL.md
---
name: my-rule
description: What this rule does
---
Body content...
```

Changes: Add `name` field, remove `globs`/`alwaysApply`, keep body exactly.

### Commands: .md → SKILL.md

```markdown
# Before: .cursor/commands/commit.md
# Commit current work
Instructions here...
```

```markdown
# After: .cursor/skills/commit/SKILL.md
---
name: commit
description: Commit current work with standardized message format
disable-model-invocation: true
---
# Commit current work
Instructions here...
```

Changes: Add frontmatter with `name` (from filename), `description` (infer from content), and `disable-model-invocation: true`.

**Note:** `disable-model-invocation: true` prevents auto-invocation — slash commands are explicitly triggered.

## Workflow

1. Create skills directories if they don't exist
2. Find files to migrate
3. For each file: read → write new SKILL.md → delete original
4. Summarize results. Let the user know they can ask to undo if needed.
