# Agent Skills

Personal skill kit for Codex, Claude Code, Cursor, and other compatible agents. Install and manage it with `npx skills`.

## Quick Start

```bash
# Install every skill in this repository globally for all agents
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands -g --all

# Install one skill globally for all agents
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands/skills/task-groundwork -g --all

# Remove one global skill
npx skills@latest remove task-groundwork -g -y
```

## Skills

Invokable via `/skill-name` in Claude Code, or installed into other agents via `npx skills`. See [skills/INDEX.md](skills/INDEX.md) for a grouped index.

| Skill | Description |
|-------|-------------|
| [task-groundwork](skills/task-groundwork/SKILL.md) | Ground a roadmap task in phase context — resolve its decision tree from artifacts, ready for to-spec |
| [adversarial-spec-review](skills/adversarial-spec-review/SKILL.md) | Red-team review that tries to kill a plan or spec; P0–P3 findings with verdict |
| [spec-readiness](skills/spec-readiness/SKILL.md) | Implementation-readiness check — can an implementer start every task tomorrow? |
| [to-spec](skills/to-spec/SKILL.md) | Turn conversation context into a production-ready spec folder |
| [revise-spec-from-review](skills/revise-spec-from-review/SKILL.md) | Verify supplied review findings and apply only confirmed, in-scope, surgical spec revisions |
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

## Manage Installed Skills

Skills follow the [open agent skills](https://github.com/vercel-labs/skills) format. Works with Claude Code, Codex, Cursor, and other supported agents.

```bash
# List global skills
npx skills@latest list -g

# Update global skills
npx skills@latest update -g
```

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

## Repository Layout

```
.
└── skills/              # invokable skills (see skills/INDEX.md)
```
