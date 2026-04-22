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
│   └── senior-implementer-opus.md    # Frontmatter-locked Opus implementer (explicit override)
│
├── agent-templates/           # Per-project agent templates (CORE + PROJECT CONTEXT structure, copied by init-project.sh)
│   ├── ux-expert.md           # UX expert agent template
│   ├── product-lead.md        # CPO/Head of Product agent template
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

`install.sh` creates symlinks from `~/.claude/skills/`, `~/.claude/commands/`, and `~/.claude/agents/` into this repo. After it runs, all skills, commands, and global subagents are immediately available in every Claude Code session — no restart needed.

Configure `~/.claude/settings.json` separately as you prefer (allow-list, MCP servers, etc.) — settings are personal and intentionally not templated here.

## New Project Setup

```bash
cd ~/agent-skills
./init-project.sh /path/to/my-project
```

`init-project.sh`:
1. Symlinks agent-os standard commands to `.claude/commands/agent-os/`
2. Lets you pick which agent templates to copy
3. Sets up `.claude/agent-memory/` directories
4. Prompts you to customize the `## PROJECT CONTEXT` section in each agent

## Keeping Agents Updated

When a template agent is improved (new Claude update, better prompting, etc.):

```bash
./update-agents.sh /path/to/projects/dir
```

Shows which project agents are behind their templates. To update manually:
1. Open the project agent file
2. Compare `## CORE` with the template
3. Update `## CORE`, keep `## PROJECT CONTEXT` unchanged
4. Update the `based-on` header with today's date + time

## Agent Template Structure

Each agent template uses this structure:

```markdown
---
based-on: agent-name@YYYY-MM-DD-HHMM
name: agent-name
description: "..."
model: sonnet
memory: project
---

## CORE
[Generic, reusable agent behavior — update when template improves]

---

## PROJECT CONTEXT
[Project-specific context — customize per project, never overwritten by updates]
```

## Sources & Credits

This repo vendors content from [mattpocock/skills](https://github.com/mattpocock/skills) and adapts Brian Casel's [agent-os](https://github.com/buildermethods/agent-os), alongside original work. See [CREDITS.md](CREDITS.md) for full attribution.

