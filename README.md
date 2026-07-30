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

## Skill Design Dependencies

`skill-design-loop` and `skill-draft-ship` are explicit-only entry points.
They resolve the active repository as source of truth and never fall back to
globally installed sibling content.

| Skill | Required repository siblings |
|---|---|
| `skill-design-loop` | Always: `skill-brief`, `skill-path-selector`, `methodology-selector`, `skill-draft-ship`; intake gaps: `grill-me`; methodology path: `methodology-skill-creator` |
| `skill-draft-ship` | Methodology draft only: `methodology-skill-creator`; ship consumes, but does not invoke, `skill-review` and `skill-composition` evidence |

## Skills

Invokable via `/skill-name` in Claude Code, or installed into other agents via `npx skills`. See [skills/INDEX.md](skills/INDEX.md) for a grouped index.

| Skill | Description |
|-------|-------------|
| [task-groundwork](skills/task-groundwork/SKILL.md) | Apply 5W2H to ground a non-trivial software task into an evidence-backed decision context before specification or implementation. |
| [grill-me](skills/grill-me/SKILL.md) | Stress-test a plan, decision, or idea through a one-question-at-a-time interview. |
| [adversarial-spec-review](skills/adversarial-spec-review/SKILL.md) | Red-team review that tries to kill a plan; P0–P3 findings with verdict. |
| [spec-readiness](skills/spec-readiness/SKILL.md) | Final gate: can an implementer start every task tomorrow? |
| [to-spec](skills/to-spec/SKILL.md) | Apply Work Breakdown Structure to produce an evidence-backed four-file specification for one bounded software change. |
| [revise-spec-from-review](skills/revise-spec-from-review/SKILL.md) | Reconcile only supplied spec-review findings: verify the finding and remedy separately, edit confirmed in-scope issues, and push back on the rest. |
| [senior-implementer](skills/senior-implementer/SKILL.md) | Implement a spec or brief end-to-end, and apply complete review findings as bounded fixes. Trust the spec, stop when it breaks, ship complete. |
| [tdd](skills/tdd/SKILL.md) | Red-green-refactor TDD loop, with reference docs on tests, mocking, refactoring, deep modules, interface design. |
| [triage-issue](skills/triage-issue/SKILL.md) | Investigate a bug, find root cause, file a GitHub issue with a TDD-based fix plan. |
| [commit-work](skills/commit-work/SKILL.md) | Stage intended changes, split coherent Conventional Commits, and verify; push only when explicitly asked. |
| [adversarial-diff-review](skills/adversarial-diff-review/SKILL.md) | Hostile shipping/merge gate: kill-test a branch/PR diff against the task definition; P0–P3 findings with file:line evidence and a coverage declaration. |
| [review-implementation](skills/review-implementation/SKILL.md) | Before-PR named-spec compliance: checklist + known-pitfall sweep (tenancy, auth, migrations, payments); Ready-for-PR verdict (not the hostile merge gate). |
| [pr-branch](skills/pr-branch/SKILL.md) | Write a two-block PR description (non-technical summary + technical detail), open the PR. |
| [session-handoff](skills/session-handoff/SKILL.md) | Optional controlled resume packet for a fresh window when mid-work context must survive; not a mandatory end-of-goal step. |
| [prompt-creator](skills/prompt-creator/SKILL.md) | Interview-driven Claude prompt builder grounded in Anthropic's best practices. |
| [skill-brief](skills/skill-brief/SKILL.md) | 5W2H: fill the skill-path-selector checklist; use bounded grill-me only for missing fields. |
| [skill-router](skills/skill-router/SKILL.md) | Decision Matrix: recommend exactly one catalog skill for a job, or none/blocked. |
| [skill-composition](skills/skill-composition/SKILL.md) | Procedural: check one skill's invoke/forbid/require edges against the catalog. |
| [skill-path-selector](skills/skill-path-selector/SKILL.md) | Decision Matrix: choose methodology / decompose / procedural / blocked from the skill checklist (via skill-brief when incomplete). |
| [skill-design-loop](skills/skill-design-loop/SKILL.md) | Explicitly orchestrate repository skill intake, path selection, and one proposal draft; stop before review or ship. |
| [skill-draft-ship](skills/skill-draft-ship/SKILL.md) | Explicitly draft from a complete selected path or ship after purpose and composition gates. |
| [skill-review](skills/skill-review/SKILL.md) | SMART Goals: purpose_pass / purpose_fail on a draft path only. |
| [revise-skill-from-review](skills/revise-skill-from-review/SKILL.md) | PDCA: closed-list draft edits after purpose_fail. |
| [tune-skill](skills/tune-skill/SKILL.md) | Tactical, complaint-driven edit to an existing shipped skill: diagnose root cause, smallest change, cold-read review. |
| [methodology-selector](skills/methodology-selector/SKILL.md) | Select one of twelve canonical methodologies, or none, using positive fit, negative-fit veto, and stage precedence. |
| [goal-engineering](skills/goal-engineering/SKILL.md) | Render the canonical eight-field contract plus controls into a goal; report the exact count and enforce a universal 4,000-character ceiling. |
| [loop-readiness-score](skills/loop-readiness-score/SKILL.md) | Score eleven weighted criteria out of 100, rerender, independently recount, and gate a goal without repairing or executing it. |
| [loop-run-record](skills/loop-run-record/SKILL.md) | Normalize externally supplied evidence after one ready run, bind it to the exact goal/readiness identity, and return it for human review. |
| [methodology-skill-creator](skills/methodology-skill-creator/SKILL.md) | Create one task-scoped methodology SKILL.md from a completed selector contract; focused skill content may exceed the loop goal's 4,000-character ceiling. |
| [loop-orchestrator](skills/loop-orchestrator/SKILL.md) | Preserve and route the shared contract between focused design and evidence skills; never execute or self-approve. |

## Manage Installed Skills

Skills follow the [open agent skills](https://github.com/vercel-labs/skills) format. Works with Claude Code, Codex, Cursor, and other supported agents.

To migrate from the former personal `skill-creator` package without leaving a
name collision with a host-provided skill:

```bash
npx skills@latest remove skill-creator -g -y
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands -g --all
npx skills@latest list -g
```

Global migration is human-owned. Repository agents do not run these commands.

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

Body shape and length vary by purpose. Methodology-generated skills follow a discovery-boundary formula (see `methodology-skill-creator/references/creator-contract.md`); procedural skills use a short summary/when pattern without `Apply Method`. The full skill-design standard is the Skill design loop in [WORKFLOW.md](WORKFLOW.md).

## Repository Layout

```
.
├── WORKFLOW.md           # stable multi-session working method
├── skills/               # invokable skills (see skills/INDEX.md)
│   └── lifecycle-build/  # support fixtures and smokes (no root SKILL.md)
└── .skill-proposals/     # gitignored drafts from skill-draft-ship
```
