# Agent Skills and Commands

Centralized repository for AI agent skills, commands, and templates. Clone once, use everywhere.

## Structure

```
├── skills/                    # Claude Code skills (symlinked to ~/.claude/skills/)
│   ├── tdd/                   # Test-driven development
│   ├── grill-me/              # Design interview / stress-test a plan
│   ├── triage-issue/          # Bug investigation + GitHub issue creation
│   ├── request-refactor-plan/ # Refactor planning with incremental commits
│   ├── improve-codebase-architecture/  # Architecture analysis
│   ├── commit-work/           # Smart commit: picks model by diff size, writes conventional commits
│   ├── pr-branch/             # PR description with non-technical + technical blocks
│   └── session-handoff/       # Structured handoff doc for the next session
│
├── commands/                  # Claude Code global commands (symlinked to ~/.claude/commands/)
│   └── make-agent-do-things.md  # Delegate to senior engineer subagents (Sonnet default, Opus override)
│
├── agents/                    # Global Claude Code subagents (symlinked to ~/.claude/agents/)
│   ├── senior-implementer-sonnet.md  # Frontmatter-locked Sonnet implementer
│   ├── senior-implementer-opus.md    # Frontmatter-locked Opus implementer (explicit override)
│   ├── ux-expert.md           # UX flows, microcopy, accessibility
│   ├── product-lead.md        # CPO/Head of Product strategy
│   ├── cto.md                 # Pre-decision technical advisor: design, packages, migration, performance, upgrades, tech debt
│   ├── review-design.md       # Plan/design review, architectural risk, cross-model review
│   └── review-implementation.md  # Spec vs implementation QA + silent failure audit
│
└── standards/                 # agent-os standard commands (symlinked per project)
    ├── shape-spec.md          # Plan mode spec shaping
    ├── plan-product.md        # Product documentation setup
    ├── inject-standards.md    # Inject relevant standards into context
    ├── index-standards.md     # Rebuild standards index
    └── discover-standards.md  # Extract codebase patterns as standards

Plus three shell scripts at the repo root:
- `install.sh` — symlinks skills, commands, and global agents into `~/.claude/`
- `init-project.sh` — per-project setup (agent-os symlinks, memory scaffold, .gitignore)
- `scan-legacy-agents.sh` — find project-local agent copies that shadow the new global agents
```

## Skill Anatomy

Skills in this repo follow the conventions used by [mattpocock/skills](https://github.com/mattpocock/skills).

### Frontmatter

```markdown
---
name: skill-name
description: [Verb-first sentence about what it does]. Use when [trigger conditions + literal phrases the user might say].
---
```

- `name` — required. Lowercase, hyphenated, must match the directory name.
- `description` — required. Drives skill discovery. See formula below.
- `disable-model-invocation: true` — optional. Set this when the skill should ONLY trigger on an explicit `/skill-name` invocation, not on description matching. Useful for behavioral mode-switches (e.g. a hypothetical `zoom-out`) where you don't want the model auto-applying it from context.

There is **no `type:` field**. Skill type is a conceptual decision for the author, not a declared piece of metadata.

### Description formula

> [What it does — verb-first, present tense, one sentence]. Use when [trigger conditions + literal phrases user might say to invoke it].

Example from [skills/grill-me/SKILL.md](skills/grill-me/SKILL.md):

> Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".

### Skill types

There are five conceptual types. Pick one before you start writing — it tells you how long the body should be and what shape it should take. The type is never declared in frontmatter.

| Type | Shape | Example |
|------|-------|---------|
| **behavioral** | Mode/stance switch. 1–3 sentence body. | [skills/grill-me/SKILL.md](skills/grill-me/SKILL.md) |
| **methodology** | Knowledge-dense. SKILL.md overview plus N reference docs. | [skills/tdd/SKILL.md](skills/tdd/SKILL.md), [skills/improve-codebase-architecture/SKILL.md](skills/improve-codebase-architecture/SKILL.md) |
| **workflow** | Sequenced steps / checklist. Numbered process. | [skills/triage-issue/SKILL.md](skills/triage-issue/SKILL.md), [skills/request-refactor-plan/SKILL.md](skills/request-refactor-plan/SKILL.md) |
| **utility** | Tool wrapper. Command/syntax plus do/don't boundaries. | _(no example in this repo)_ |
| **authoring** | Guide for creating other things. Numbered process plus example output. | See [mattpocock/skills/write-a-skill](https://github.com/mattpocock/skills/tree/main/write-a-skill) |

## New Machine Setup

**Prerequisites:** [Claude Code](https://claude.ai/code) must be installed and you must have run it at least once (so `~/.claude/` exists).

```bash
git clone https://github.com/hburaktasyurek/Agent-Skills-and-Commands ~/agent-skills
cd ~/agent-skills
./install.sh
```

Run with `./install.sh` (not `sh install.sh`) — the scripts require bash.

`install.sh` creates symlinks from `~/.claude/skills/`, `~/.claude/commands/`, and `~/.claude/agents/` into this repo. After it runs, all skills, commands, and global subagents are immediately available in every Claude Code session — no restart needed.

Configure `~/.claude/settings.json` separately as you prefer (allow-list, MCP servers, etc.) — settings are personal and intentionally not templated here.

## New Project Setup

```bash
cd ~/agent-skills
./init-project.sh /path/to/my-project
```

`init-project.sh`:
1. Symlinks agent-os standard commands to `.claude/commands/agent-os/`
2. Creates an empty `.claude/agent-memory/` scaffold
3. Adds `agent-memory/` to `.claude/.gitignore` (learned context is machine-local by default)

Agents themselves are global — they live once in `~/.claude/agents/` as symlinks into this repo. No per-project copies, no version drift.

## Migrating From The Old Flow

If you previously used the copy-based flow (where `init-project.sh` copied agent templates into each project's `.claude/agents/`), those copies still take precedence over the new global symlinks — Claude Code reads project-local agents first. Running `install.sh` alone does **not** disable them.

Find them with:

```bash
./scan-legacy-agents.sh <projects-dir>
```

The scanner walks the given directory (up to 6 levels deep) and lists every `.claude/agents/<name>.md` that is a real copy (not a symlink) and shadows a same-named global agent. It does not delete — migration is manual:

1. Move anything worth keeping from the copy's `## PROJECT CONTEXT` section into `<project>/.claude/agent-memory/<name>/learned-context.md`.
2. Delete the copy so the global symlink at `~/.claude/agents/<name>.md` takes over.

Project-specific agents that don't collide with a global name (e.g. a bespoke `my-growth-strategist.md`) are ignored by the scanner and stay where they are.

## How Agents Get Project Context

Each agent bootstraps itself on first use. On initial trigger in a project, an agent:

1. Reads `.claude/agent-memory/<agent>/learned-context.md`. If it exists, use it and proceed.
2. If missing or empty, scans `agent-os/product/*.md`, `CLAUDE.md`, `README.md`, `composer.json` / `package.json` for context relevant to its role.
3. For critical gaps it cannot infer, makes its best guess and marks each one with `⚠️ Assumption:`. It does **not** block on questions — subagents invoked via the Agent tool are single-turn and cannot wait for user answers.
4. Writes findings + assumptions + an "Open Questions" list to `.claude/agent-memory/<agent>/learned-context.md` (plain markdown, no template). **Never credentials, tokens, or secrets.**
5. Proceeds with the task. Surfaces the assumptions it used at the end of its response under an `Assumptions used` heading so the user can correct them on the next call.

On later runs it reads the memory file directly. To refresh, correct an assumption in the file (or delete the file) and the next invocation will re-bootstrap.

Because memory is git-ignored by default, each machine learns its own context the first time. If you want teammates to share it, remove the `.gitignore` entry and commit deliberately — but first audit the file for anything sensitive.

## Agent Structure

Each agent is a single `.md` file with frontmatter + body + a `## BOOTSTRAP` section:

```markdown
---
name: agent-name
description: "..."
model: sonnet
tools: Read, Grep, Glob, Write
memory: project
---

[Agent behavior, role, output format, rules.]

## BOOTSTRAP

[Lazy-discovery protocol — see section above.]
```

`Write` is required: the BOOTSTRAP protocol persists learned context to `.claude/agent-memory/<name>/learned-context.md`. An agent without `Write` would re-bootstrap on every invocation.

No `based-on:` frontmatter, no `## CORE` / `## PROJECT CONTEXT` split. Global install means one copy, tracked in git history.

## Sources & Credits

This repo vendors content from [mattpocock/skills](https://github.com/mattpocock/skills) and adapts Brian Casel's [agent-os](https://github.com/buildermethods/agent-os), alongside original work. See [CREDITS.md](CREDITS.md) for full attribution.

