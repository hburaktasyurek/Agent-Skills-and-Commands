# Agent Skills

Personal skill kit for Codex, Claude Code, Cursor, and other compatible agents. Install and manage it with `npx skills`.

The stable design-review-implementation-PR process, variable model policy, and
session-based skill-improvement loop are recorded in
[WORKFLOW.md](WORKFLOW.md).

## Quick Start

```bash
# Install every skill in this repository globally for all agents
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands -g --all

# Install one skill globally for all agents
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands/skills/task-groundwork -g --all

# Remove one global skill
npx skills@latest remove task-groundwork -g -y
```

## Loop Skill Dependencies

The loop system is modular at runtime but some validator scripts import sibling
skills. Installing the whole repository is the recommended setup and includes
every dependency.

For a selective installation, install the requested skill and its transitive
dependencies together:

| Skill | Required sibling skills |
|---|---|
| `methodology-selector` | none |
| `goal-engineering` | `methodology-selector` |
| `loop-readiness-score` | `goal-engineering`, `methodology-selector` |
| `methodology-skill-creator` | `methodology-selector` |
| `loop-run-record` | `loop-readiness-score`, `goal-engineering`, `methodology-selector` |
| `loop-orchestrator` | all five loop skills above |

For example, install only the goal-rendering pair globally for all agents:

```bash
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands \
  -g --agent '*' \
  --skill methodology-selector \
  --skill goal-engineering \
  -y
```

The `npx skills` format has no transitive dependency declaration, so selecting
only a dependent skill is intentionally unsupported. Each dependent skill
checks this installation precondition before its scripts are used.

## Skills

Invokable via `/skill-name` in Claude Code, or installed into other agents via `npx skills`. See [skills/INDEX.md](skills/INDEX.md) for a grouped index.

| Skill | Description |
|-------|-------------|
| [task-groundwork](skills/task-groundwork/SKILL.md) | Apply 5W2H to ground a non-trivial software task into an evidence-backed decision context before specification or implementation. |
| [grill-me](skills/grill-me/SKILL.md) | Stress-test a plan, decision, or idea through a one-question-at-a-time interview |
| [adversarial-spec-review](skills/adversarial-spec-review/SKILL.md) | Red-team review that tries to kill a plan or spec; P0–P3 findings with verdict |
| [spec-readiness](skills/spec-readiness/SKILL.md) | Implementation-readiness check — can an implementer start every task tomorrow? |
| [to-spec](skills/to-spec/SKILL.md) | Apply Work Breakdown Structure to produce an evidence-backed four-file specification for one bounded software change. |
| [revise-spec-from-review](skills/revise-spec-from-review/SKILL.md) | Verify supplied review findings and apply only confirmed, in-scope, surgical spec revisions |
| [senior-implementer](skills/senior-implementer/SKILL.md) | Implement a spec or brief end-to-end; delegate only bounded, independent work when useful |
| [tdd](skills/tdd/SKILL.md) | Red-green-refactor TDD loop with reference docs |
| [triage-issue](skills/triage-issue/SKILL.md) | Investigate a bug and file a GitHub issue with a TDD-based fix plan |
| [commit-work](skills/commit-work/SKILL.md) | Stage intended changes, split coherent Conventional Commits, push, and verify without choosing a model |
| [adversarial-diff-review](skills/adversarial-diff-review/SKILL.md) | Red-team review that tries to kill an implementation diff against its task definition; file:line evidence + coverage declaration |
| [review-implementation](skills/review-implementation/SKILL.md) | Spec-vs-implementation compliance audit: checklist coverage + known-pitfall sweep (tenancy, auth, migrations, payments) |
| [pr-branch](skills/pr-branch/SKILL.md) | Write a two-block PR description (non-technical + technical) and open a GitHub PR |
| [session-handoff](skills/session-handoff/SKILL.md) | Optional controlled resume packet for a fresh window; not required when a goal-oriented session can finish on its own |
| [prompt-creator](skills/prompt-creator/SKILL.md) | Interview-driven Claude prompt builder grounded in Anthropic's best practices |
| [skill-brief](skills/skill-brief/SKILL.md) | 5W2H: fill the skill-path-selector checklist; use bounded grill-me only for missing fields |
| [skill-router](skills/skill-router/SKILL.md) | Decision Matrix: recommend exactly one catalog skill for a job, or none/blocked |
| [skill-composition](skills/skill-composition/SKILL.md) | Check one skill's invoke/forbid/require edges against the catalog |
| [skill-path-selector](skills/skill-path-selector/SKILL.md) | Decision Matrix: choose methodology, decompose, procedural, or blocked from a skill-design checklist |
| [skill-creator](skills/skill-creator/SKILL.md) | Draft a skill under `.skill-proposals/` or ship a purpose_pass draft into `skills/` |
| [skill-review](skills/skill-review/SKILL.md) | SMART Goals: purpose_pass or purpose_fail for a `.skill-proposals/` draft; analysis only |
| [revise-skill-from-review](skills/revise-skill-from-review/SKILL.md) | PDCA: apply closed purpose-fail remedies to a draft under `.skill-proposals/` only |
| [tune-skill](skills/tune-skill/SKILL.md) | Tactical, complaint-driven edit to an existing skill — diagnose, smallest change, review |
| [methodology-selector](skills/methodology-selector/SKILL.md) | Select one of twelve canonical methodologies, or none, using positive fit, negative-fit veto, and stage precedence |
| [goal-engineering](skills/goal-engineering/SKILL.md) | Render a verifiable loop goal from the shared eight-field contract with a universal 4,000-character ceiling |
| [loop-readiness-score](skills/loop-readiness-score/SKILL.md) | Score eleven readiness criteria out of 100 and independently gate a rendered goal as blocked, supervised, or ready |
| [loop-run-record](skills/loop-run-record/SKILL.md) | Bind externally supplied post-run evidence to the exact ready goal and return a deterministic record for human review |
| [methodology-skill-creator](skills/methodology-skill-creator/SKILL.md) | Turn one selected method and task contract into one focused methodology SKILL.md; skill length is not governed by the loop-goal limit |
| [loop-orchestrator](skills/loop-orchestrator/SKILL.md) | Coordinate selection, goal/readiness, methodology-skill creation, and post-run recording without duplicating their logic |

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
├── WORKFLOW.md          # stable multi-session working method
└── skills/              # invokable skills (see skills/INDEX.md)
```
