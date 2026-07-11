# Agent Skills and Commands

Personal skill kit for Claude Code, focused on coding and dev-workflow tasks: planning, implementation, review, and meta-skills for building more skills. Clone once, use everywhere.

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

Invokable via `/skill-name` in Claude Code, or installed into other agents via `npx skills`. See [skills/INDEX.md](skills/INDEX.md) for a grouped index.

| Skill | Description |
|-------|-------------|
| [grill-me](skills/grill-me/SKILL.md) | Stress-test a plan — relentless interviewer that resolves each branch of the decision tree |
| [task-groundwork](skills/task-groundwork/SKILL.md) | Ground a roadmap task in phase context — resolve its decision tree from artifacts, ready for to-spec |
| [adversarial-spec-review](skills/adversarial-spec-review/SKILL.md) | Red-team review that tries to kill a plan or spec; P0–P3 findings with verdict |
| [spec-readiness](skills/spec-readiness/SKILL.md) | Implementation-readiness check — can an implementer start every task tomorrow? |
| [to-spec](skills/to-spec/SKILL.md) | Turn conversation context into a production-ready spec folder |
| [senior-implementer](skills/senior-implementer/SKILL.md) | Implement a spec or brief end-to-end; delegate only bounded, independent work when useful |
| [tdd](skills/tdd/SKILL.md) | Red-green-refactor TDD loop with reference docs |
| [triage-issue](skills/triage-issue/SKILL.md) | Investigate a bug and file a GitHub issue with a TDD-based fix plan |
| [commit-work](skills/commit-work/SKILL.md) | Stage and split changes into Conventional Commits (Haiku/Sonnet by diff size) |
| [adversarial-diff-review](skills/adversarial-diff-review/SKILL.md) | Red-team review that tries to kill an implementation diff against its task definition; file:line evidence + coverage declaration |
| [review-implementation](skills/review-implementation/SKILL.md) | Spec-vs-implementation compliance audit: checklist coverage + known-pitfall sweep (tenancy, auth, migrations, payments) |
| [pr-branch](skills/pr-branch/SKILL.md) | Write a two-block PR description (non-technical + technical) and open a GitHub PR |
| [session-handoff](skills/session-handoff/SKILL.md) | Structured handoff doc capturing progress, decisions, and open questions |
| [prompt-creator](skills/prompt-creator/SKILL.md) | Interview-driven Claude prompt builder grounded in Anthropic's best practices |
| [tune-skill](skills/tune-skill/SKILL.md) | Tactical, complaint-driven edit to an existing skill — diagnose, smallest change, review |

### Global Subagents (`agents/`)

Symlinked to `~/.claude/agents/` by `scripts/install.sh`. Invoked via the Agent tool or the slash commands below. These persist as agents (rather than skills) where subagent isolation matters — separate context window, spawnable by other skills, or constrained tool surface.

| Agent | Description |
|-------|-------------|
| [cto](agents/cto.md) | Pre-decision technical advisor: schema, API design, packages, migrations, performance |
| [review-design](agents/review-design.md) | Post-decision plan review, architectural risk, cross-model second opinion |
| [product-lead](agents/product-lead.md) | CPO-level strategy: roadmap, pricing, positioning, KPIs |
| [ux-expert](agents/ux-expert.md) | UX flows, microcopy, accessibility, error/empty/loading states |

### Commands (`commands/`)

Slash commands that shim into the subagents above. Symlinked to `~/.claude/commands/`.

| Command | What it does |
|---------|-------------|
| `/cto` | Invokes the `cto` agent |
| `/review-design` | Invokes the `review-design` agent |
| `/product-lead` | Invokes the `product-lead` agent |
| `/ux-expert` | Invokes the `ux-expert` agent |

> New behavior is added as a skill first. Agents/commands persist only where they genuinely need subagent semantics. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Standards (`standards/`)

Per-project standards commands. Symlinked by `scripts/init-project.sh`.

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

This clones the repo to `~/agent-skills` (or `git pull`s it), then runs `scripts/install.sh` to symlink skills, commands, and agents into `~/.claude/`. Everything is available immediately — no restart needed.

To choose which categories to install, run the installer interactively after bootstrap:

```bash
cd ~/agent-skills && ./scripts/install.sh
```

The interactive path asks per category and prompts before removing any non-symlink files. Set `AGENT_SKILLS_SKIP_PULL=1` to skip the pull.

Custom install directory:

```bash
AGENT_SKILLS_DIR=/opt/agent-skills curl -fsSL https://raw.githubusercontent.com/hburaktasyurek/Agent-Skills-and-Commands/main/bootstrap.sh | bash
```

## New Project Setup

```bash
cd ~/agent-skills && ./scripts/init-project.sh /path/to/my-project
```

This symlinks standard commands to `.claude/commands/agent-os/`, creates an empty `.claude/agent-memory/` scaffold, and adds `agent-memory/` to `.claude/.gitignore` (learned context is machine-local by default).

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

Each skill is a directory under `skills/` with a `SKILL.md` at minimum:

```markdown
---
name: skill-name
description: What it does, and when to trigger it.
---

(body — shape varies by purpose)
```

- `name` — required. Lowercase, hyphenated, matches the directory name.
- `description` — required. Drives skill discovery; write it so Claude knows when to use it.
- `disable-model-invocation: true` — optional. Forces explicit `/skill-name` invocation (useful for mode-switches).

Body shape and length vary by what the skill is for — some are three sentences, others are long with reference docs as siblings of `SKILL.md`. No template is enforced.

## Migrating From the Old Flow

If you previously used the copy-based flow (agent templates copied into each project's `.claude/agents/`), those copies still take precedence over global symlinks. Find them with:

```bash
./scripts/scan-legacy-agents.sh <projects-dir>
```

The scanner walks up to 6 levels deep and lists every `.claude/agents/<name>.md` that is a real copy shadowing a same-named global agent. It does not delete anything — migration is manual:

1. Move anything worth keeping from the copy's `## PROJECT CONTEXT` section into `<project>/.claude/agent-memory/<name>/learned-context.md`.
2. Delete the copy so the global symlink at `~/.claude/agents/<name>.md` takes over.

Project-specific agents that don't collide with a global name are ignored by the scanner.

## Repository Layout

```
.
├── bootstrap.sh         # curl | bash entry point (stays at root)
├── scripts/             # install / init-project / scan-legacy
├── skills/              # invokable skills (see skills/INDEX.md)
├── agents/              # global subagent templates
├── commands/            # slash-command shims into agents
└── standards/           # per-project standards commands
```
