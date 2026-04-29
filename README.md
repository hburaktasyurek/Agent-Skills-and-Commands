# Agent Skills and Commands

Centralized repository for AI agent skills, commands, and subagent templates for Claude Code. Clone once, use everywhere.

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/hburaktasyurek/Agent-Skills-and-Commands/main/bootstrap.sh | bash
```

Or install a single skill via `npx`:

```bash
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands/skills/grill-me
```

## What's Included

### Skills (`skills/`)

Invokable via `/skill-name` in Claude Code, or installed into other agents via `npx skills`.

| Skill | Type | Description |
|-------|------|-------------|
| [grill-me](skills/grill-me/SKILL.md) | behavioral | Stress-test a plan — relentless interviewer that resolves each branch of the decision tree |
| [adversarial-review](skills/adversarial-review/SKILL.md) | behavioral | Red-team review that tries to kill a plan; P0–P3 findings with verdict |
| [tdd](skills/tdd/SKILL.md) | methodology | Red-green-refactor TDD loop with reference docs |
| [improve-codebase-architecture](skills/improve-codebase-architecture/SKILL.md) | methodology | Find architectural improvements and deepen shallow modules |
| [triage-issue](skills/triage-issue/SKILL.md) | workflow | Investigate a bug and file a GitHub issue with a TDD-based fix plan |
| [request-refactor-plan](skills/request-refactor-plan/SKILL.md) | workflow | Interview-driven refactor plan, filed as a GitHub issue |
| [commit-work](skills/commit-work/SKILL.md) | workflow | Stage and split changes into Conventional Commits (Haiku/Sonnet by diff size) |
| [pr-branch](skills/pr-branch/SKILL.md) | workflow | Write a two-block PR description (non-technical + technical) and open a GitHub PR |
| [session-handoff](skills/session-handoff/SKILL.md) | workflow | Structured handoff doc capturing progress, decisions, and open questions |
| [to-spec](skills/to-spec/SKILL.md) | workflow | Convert conversation context into a spec folder |

### Global Subagents (`agents/`)

Symlinked to `~/.claude/agents/` by `install.sh`. Invoked via the Agent tool or the slash commands below.

| Agent | Description |
|-------|-------------|
| [senior-implementer-sonnet](agents/senior-implementer-sonnet.md) | Default implementer, pinned to Sonnet |
| [senior-implementer-opus](agents/senior-implementer-opus.md) | Implementer pinned to Opus for harder tasks |
| [cto](agents/cto.md) | Pre-decision technical advisor: schema, API design, packages, migrations, performance |
| [review-design](agents/review-design.md) | Post-decision plan review, architectural risk, cross-model second opinion |
| [review-implementation](agents/review-implementation.md) | Spec-vs-implementation QA: missing requirements, auth gaps, silent failures |
| [product-lead](agents/product-lead.md) | CPO-level strategy: roadmap, pricing, positioning, KPIs |
| [ux-expert](agents/ux-expert.md) | UX flows, microcopy, accessibility, error/empty/loading states |

### Commands (`commands/`)

Slash commands that shim into the subagents above. Symlinked to `~/.claude/commands/`.

| Command | What it does |
|---------|-------------|
| `/cto` | Invokes the `cto` agent |
| `/review-design` | Invokes the `review-design` agent |
| `/review-implementation` | Invokes the `review-implementation` agent |
| `/product-lead` | Invokes the `product-lead` agent |
| `/ux-expert` | Invokes the `ux-expert` agent |
| `/make-agent-do-things` | Delegates a brief to a senior engineer subagent (Sonnet default, Opus override) |

### Standards (`standards/`)

Agent-OS standard commands for per-project setup. Symlinked by `init-project.sh`.

`plan-product` · `inject-standards` · `index-standards` · `discover-standards`

## Install & Update

### Via npx skills (cross-tool)

Skills follow the [open agent skills](https://github.com/vercel-labs/skills) format. Works with Claude Code, Codex, Cursor, and 40+ other agents.

```bash
# Single skill
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands/skills/grill-me

# All skills
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands --all

# All skills, targeting Claude Code
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands --all -a claude-code
```

### Via bootstrap.sh (Claude Code only)

**Prerequisites:** Claude Code installed and run at least once (`~/.claude/` must exist). `git` and `bash` in PATH.

```bash
# First install or any subsequent update
curl -fsSL https://raw.githubusercontent.com/hburaktasyurek/Agent-Skills-and-Commands/main/bootstrap.sh | bash
```

This clones the repo to `~/agent-skills` (or `git pull`s it), then runs `install.sh` to symlink skills, commands, and agents into `~/.claude/`. Everything is available immediately — no restart needed.

To choose which categories to install, run `install.sh` interactively after bootstrap:

```bash
cd ~/agent-skills && ./install.sh
```

The interactive path asks per category and prompts before removing any non-symlink files. Set `AGENT_SKILLS_SKIP_PULL=1` to skip the pull.

Custom install directory:

```bash
AGENT_SKILLS_DIR=/opt/agent-skills curl -fsSL https://raw.githubusercontent.com/hburaktasyurek/Agent-Skills-and-Commands/main/bootstrap.sh | bash
```

## New Project Setup

```bash
cd ~/agent-skills && ./init-project.sh /path/to/my-project
```

This symlinks agent-os standard commands to `.claude/commands/agent-os/`, creates an empty `.claude/agent-memory/` scaffold, and adds `agent-memory/` to `.claude/.gitignore` (learned context is machine-local by default).

Agents themselves are global — they live once in `~/.claude/agents/` as symlinks. No per-project copies, no version drift.

## How Agents Learn Project Context

Agents bootstrap themselves on first use in a project:

1. Reads `.claude/agent-memory/<agent>/learned-context.md`. If it exists, proceed.
2. If missing, scans `agent-os/product/*.md`, `CLAUDE.md`, `README.md`, and package manifests for relevant context.
3. Marks unresolvable gaps with `⚠️ Assumption:` — never blocks to ask (subagents are single-turn).
4. Writes findings to `.claude/agent-memory/<agent>/learned-context.md`. Never stores credentials or secrets.
5. Surfaces used assumptions at the end of its response under an `Assumptions used` heading.

On later runs it reads the memory file directly. To refresh, edit or delete the file.

Memory is git-ignored by default. To share with teammates, remove the `.gitignore` entry and commit deliberately — audit for sensitive content first.

## Skill Anatomy

Skills follow the [mattpocock/skills](https://github.com/mattpocock/skills) convention.

### Frontmatter

```markdown
---
name: skill-name
description: [Verb-first sentence about what it does]. Use when [trigger conditions + literal phrases the user might say].
---
```

- `name` — required. Lowercase, hyphenated, must match the directory name.
- `description` — required. Drives skill discovery; see formula below.
- `disable-model-invocation: true` — optional. Forces explicit `/skill-name` invocation only (useful for behavioral mode-switches).

No `type:` field — skill type is a conceptual decision, not declared metadata.

### Description formula

> *[What it does — verb-first, present tense]. Use when [trigger conditions + literal phrases the user might say].*

### Skill types

Pick one before writing — it determines body length and shape.

| Type | Shape |
|------|-------|
| **behavioral** | Mode/stance switch. 1–3 sentence body. |
| **methodology** | Knowledge-dense. SKILL.md overview + N reference docs. |
| **workflow** | Sequenced steps or checklist. Numbered process. |
| **utility** | Tool wrapper. Command/syntax + do/don't boundaries. |
| **authoring** | Guide for creating other things. Numbered process + example output. |

## Migrating From the Old Flow

If you previously used the copy-based flow (agent templates copied into each project's `.claude/agents/`), those copies still take precedence over global symlinks. Find them with:

```bash
./scan-legacy-agents.sh <projects-dir>
```

The scanner walks up to 6 levels deep and lists every `.claude/agents/<name>.md` that is a real copy shadowing a same-named global agent. It does not delete anything — migration is manual:

1. Move anything worth keeping from the copy's `## PROJECT CONTEXT` section into `<project>/.claude/agent-memory/<name>/learned-context.md`.
2. Delete the copy so the global symlink at `~/.claude/agents/<name>.md` takes over.

Project-specific agents that don't collide with a global name are ignored by the scanner.

## Sources & Credits

This repo vendors content from [mattpocock/skills](https://github.com/mattpocock/skills) and adapts Brian Casel's [agent-os](https://github.com/buildermethods/agent-os), alongside original work. See [CREDITS.md](CREDITS.md) for full attribution.
