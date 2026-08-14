# Agent Skills

Personal skill kit for Codex, Claude Code, Cursor, and other compatible agents.
Install and manage it with `npx skills`. The stable product workflow is in
[WORKFLOW.md](WORKFLOW.md).

## Quick Start

```bash
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands -g --all
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands/skills/task-groundwork -g --all
npx skills@latest remove task-groundwork -g -y
```

Repository agents modify only this repository. Global installation and
synchronization remain separate, human-owned steps.

## Skills

See [skills/INDEX.md](skills/INDEX.md) for the grouped index.

| Skill | Description |
|---|---|
| [codex-task-to-spec](skills/codex-task-to-spec/SKILL.md) | Resumable Codex-native immutable spec gate with pinned ephemeral subagents. |
| [omp-task-to-spec](skills/omp-task-to-spec/SKILL.md) | OMP parent spec gate under orchestrate; not the four-file author. |
| [task-groundwork](skills/task-groundwork/SKILL.md) | Ground a non-trivial software task with decision-changing evidence. |
| [grill-me](skills/grill-me/SKILL.md) | Stress-test a plan or decision one question at a time. |
| [to-spec](skills/to-spec/SKILL.md) | Produce a consequence-calibrated implementation spec. |
| [adversarial-spec-review](skills/adversarial-spec-review/SKILL.md) | Evidence-bounded red-team review of a plan or spec. |
| [spec-readiness](skills/spec-readiness/SKILL.md) | Check whether implementation can start without inventing structural contracts. |
| [senior-implementer](skills/senior-implementer/SKILL.md) | Implement approved work and close task-related causes across affected surfaces. |
| [tdd](skills/tdd/SKILL.md) | Build through vertical red-green-refactor cycles. |
| [review-implementation](skills/review-implementation/SKILL.md) | Check a named spec against its implementation before PR. |
| [adversarial-diff-review](skills/adversarial-diff-review/SKILL.md) | Hostile review of an explicit pre-PR diff boundary. |
| [risk-calibrated-pr-review](skills/risk-calibrated-pr-review/SKILL.md) | Consequence-calibrated hostile review of an opened PR. |
| [commit-work](skills/commit-work/SKILL.md) | Stage and commit intended changes; push only when requested. |
| [pr-branch](skills/pr-branch/SKILL.md) | Write a two-audience PR description, then open or refresh the PR. |
| [session-handoff](skills/session-handoff/SKILL.md) | Preserve exact unresolved state across sessions or harnesses. |
| [skill-eval](skills/skill-eval/SKILL.md) | Standalone comparison utility; not used by this repository's maintenance policy. |

## Skill Maintenance

Use the host-provided `skill-creator` to create or update
`skills/<name>/`. It owns concrete-example intake, package design,
and structural validation.

```text
skill-creator
→ exact diff and structural validation
→ human review of real-task evidence when available
→ commit-work
```

This repository does not run model-judged evals, synthetic eval cases, baseline
comparisons, or `skill-eval` for skill maintenance. A high eval score does not
establish reliable behavior in real work. When real-task evidence is not yet
available, say so instead of substituting a scored simulation. The standalone
`skill-eval` package keeps only its own self-test fixtures; they are not a
maintenance gate for this repository.

## Manage Installed Skills

```bash
npx skills@latest list -g
npx skills@latest update -g
```

Run `update -g` interactively when this repository has removed skills and
approve the deletion prompt. Passing `-y` deliberately skips deletion of
skills that disappeared upstream. Run `list -g` afterward to verify the
installed set.

## Skill Anatomy

```text
skills/example/
├── SKILL.md
├── agents/openai.yaml   # optional host metadata
├── scripts/             # optional deterministic helpers
├── references/          # optional on-demand knowledge
└── assets/              # optional output resources
```

The frontmatter must contain a lowercase hyphenated `name` matching the
directory and a concise `description` that states what the skill does and
when to use it. Include only runtime-relevant files.

`npx skills` installs each `skills/<name>/` directory as its own package.
A file a skill reads at runtime must live inside that directory. Do not put
shared runtime files at `skills/*.md` or point at a sibling skill with `../`.
If two skills need the same ontology, each ships an identical copy under
`references/`. Repo-root files (`WORKFLOW.md`, `AGENTS.md`) are not skill
packages.
