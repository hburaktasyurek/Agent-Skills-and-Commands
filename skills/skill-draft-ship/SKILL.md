---
name: skill-draft-ship
description: "Draft one repository skill proposal from a complete checklist and selected path, or ship a reviewed proposal after explicit human approval and current composition evidence. Explicit invocation only; does not perform intake, path selection, purpose review, or implicit routing. Triggers: skill-draft-ship; draft selected skill; ship reviewed skill."
disable-model-invocation: true
---

# skill-draft-ship

## Objective

Persist one already-selected methodology or procedural skill proposal under
`.skill-proposals/`, or ship one reviewed proposal into `skills/` after all
human and composition gates pass.

Do not perform intake, path selection, purpose review, composition review, or
implicit routing.

## Invocation

- `/skill-draft-ship` in Cursor or Claude Code
- `$skill-draft-ship` in Codex
- `skill-draft-ship`

Explicit invocation is required.

## Repository source of truth

Before either mode:

1. Resolve `repo_root` from the active task working directory with
   `git rev-parse --show-toplevel`.
2. Require `<repo_root>/WORKFLOW.md`, `<repo_root>/skills/INDEX.md`, and every
   sibling `SKILL.md` needed by the selected mode.
3. Read sibling instructions only from `<repo_root>/skills/`. Never use a
   globally installed Codex, Cursor, Claude, or `.agents` copy as source or
   fallback.
4. If repository discovery or a dependency fails, write nothing and return
   `blocked`.

Draft writes are restricted to
`<repo_root>/.skill-proposals/<skill_name>/`. Ship writes are restricted to
the approved `skills/<skill_name>/` package plus `skills/INDEX.md` and
`README.md`.

## Input contracts

### Draft mode

Require all of:

- `mode: draft`
- A complete checklist with `purpose`, `audience`, `when_to_use`, `when_not`,
  `success_signal`, `boundaries`, `context`, `output_format`, `skill_name`,
  `skill_summary`, optional `invocation`, and
  `replace: none | proposal | shipped | both`
- A `path` result whose verdict is exactly `methodology` or `procedural`, with
  rationale; methodology also requires the unmodified
  `methodology-selector` contract and selection

Missing or malformed inputs return `blocked`; do not invoke `skill-brief`,
`skill-path-selector`, or `skill-review`.

### Ship mode

Require all of:

- `mode: ship`
- An explicit human ship utterance naming the skill
- The exact `.skill-proposals/<skill_name>/` draft path
- `purpose_pass` for that draft
- Either `composition_ok` from `skill-composition` for the current draft
  content in this ship attempt, or an explicit human composition skip naming
  the skill and giving a reason
- When `skills/<skill_name>/` already exists, a fresh explicit human
  `ship_replace: true` utterance naming that shipped target in this ship
  attempt

Intake-time replacement permission never authorizes a later shipped-package
overwrite.

## Collision contract

Normalize omitted replacement permission to `replace: none`; never infer or
upgrade it.

| Existing target | Required draft permission | Draft effect |
|---|---|---|
| proposal only | `proposal` or `both` | May replace only the proposal after the replacement content validates |
| shipped only | `shipped` or `both` | May create a replacement proposal; shipped package remains untouched |
| both | `both` | May replace only the proposal; shipped package remains untouched |

Permission is valid only when the human names `skill_name` and the target kind
in the current task. Any unauthorized collision returns `blocked` with the
kind and exact paths.

## Workflow

### Draft mode

1. Resolve the repository and validate the full draft input contract.
2. Recheck proposal and shipped collisions immediately before writing and
   enforce the replacement table.
3. For `methodology`, read and run repository
   `methodology-skill-creator` directly. Prepare its JSON input from the
   selector handoff; never ask the human to hand-write it. The renderer only
   proposes content, so remap its proposed `SKILL.md` to the proposal target.
   Do not route through `loop-orchestrator`.
4. For `procedural`, author one focused `SKILL.md` using the repository's
   procedural summary/when style without an `Apply {Method}` formula.
5. Validate the complete proposed package before changing an existing
   proposal. A failed validation leaves the existing proposal unchanged.
6. Write exactly one proposal and return `draft_created`; stop for a separate
   `skill-review`.

### Ship mode

1. Resolve the repository and validate every ship input gate.
2. Treat any draft edit after `composition_ok` as invalidating that evidence.
   Composition is an input artifact, not a skill this mode invokes.
3. If the destination exists, require the fresh `ship_replace: true` approval.
4. Copy `.skill-proposals/<skill_name>/` to `skills/<skill_name>/`.
5. Update `skills/INDEX.md` and the README Meta list from the shipped
   description.
6. Delete the proposal only after the package and both documentation updates
   succeed. On any failure, stop and preserve the draft.

## Results

Draft success:

```yaml
result: draft_created
draft:
  path: <repo_root>/.skill-proposals/<skill_name>
  replaced_proposal: true | false
```

Ship success:

```yaml
result: shipped
skill:
  path: <repo_root>/skills/<skill_name>
composition: <composition_ok payload>
# Or, only for an explicit human skip:
composition_skip:
  by: human
  skill: <skill_name>
  reason: <human reason>
```

Failure:

```yaml
result: blocked
blocked:
  code: repo_root_missing | missing_dependency | invalid_input | collision | validation_failed | ship_gate_failed
  missing_dependencies: []
  collision:
    kind: proposal | shipped | both
    paths: []
  required_action: ...
```

## Validation

- Draft input is complete and selected before any write.
- Draft mode writes only the authorized proposal.
- Methodology draft calls `methodology-skill-creator` directly and never calls
  `loop-orchestrator`.
- Replacement content validates before an existing proposal changes.
- Ship evidence names the current draft; fresh shipped-target replacement
  approval is present when required.
- Ship leaves `skills/<skill_name>/` present and deletes the draft only after
  package and documentation updates succeed.

## Boundaries

- Do not perform intake or invoke `skill-brief`.
- Do not select a path or invoke `skill-path-selector`.
- Do not select a methodology or absorb `methodology-selector`.
- Do not judge purpose or invoke `skill-review`.
- Do not invoke `skill-composition`; require its artifact in ship mode.
- Do not write `skills/<name>/` in draft mode.
- Do not commit, push, install globally, or edit files outside the repository.

## Human review and stop

Human approval is required before replacing a proposal, creating a replacement
draft for a shipped name, replacing a shipped package, skipping composition,
or shipping.

Stop after one draft, one ship, or one blocked result.
