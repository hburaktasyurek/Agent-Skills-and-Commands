---
name: skill-draft-ship
description: "Draft one repository skill proposal with behavior and trigger eval definitions, or ship it only after hash-bound purpose, behavioral-eval, composition, and human gates pass. Explicit invocation only; does not perform intake, path selection, review, evaluation, or implicit routing. Triggers: skill-draft-ship; draft selected skill; ship reviewed skill."
disable-model-invocation: true
---

# skill-draft-ship

## Objective

Persist one already-selected methodology or procedural skill proposal under
`.skill-proposals/`, or ship one reviewed proposal into `skills/` after all
purpose, behavioral-evaluation, composition, and human gates pass.

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
2. Require `<repo_root>/WORKFLOW.md`, `<repo_root>/skills/INDEX.md`, repository
   `skill-eval`, and every sibling `SKILL.md` needed by the selected mode.
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
  `skill_summary`, at least two `evaluation_examples`, optional `invocation`, and
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
- `purpose_pass` bound to the current draft package hash
- `skill_eval_pass` from `skill-eval verify`, bound to the same hash, including
  its run summary, evidence workspace, hashed run/artifact evidence, and
  verifier invocation inputs
- `composition_ok` from `skill-composition`, bound to the same hash; or only
  when the checker returned `blocked` for a technical execution reason, an
  explicit human composition skip naming the skill, reason, and blocked evidence
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
5. Create `evals/evals.json` with at least three cases: preserve the supplied
   examples and add one synthetic scope-preservation case derived from
   `when_not` or `boundaries`. Use realistic prompts, observable expected
   outputs, files when needed, and source/case-type metadata. Do not add
   assertions or run results.
6. Create `evals/trigger_queries.json` with about twenty train/validation
   queries split between positive and near-miss negative cases. For an
   explicit-only skill, positive cases name the skill and equivalent bare-task
   cases are negative. Do not add observed trigger results.
7. Validate the eval definition in calibrate phase and compute the complete
   package hash with repository `skill-eval` scripts.
8. Validate the complete proposed package before changing an existing
   proposal. A failed validation leaves the existing proposal unchanged.
9. Write exactly one proposal and return `draft_created`; stop for a separate
   `skill-review`.

### Ship mode

1. Resolve the repository, compute the current draft package hash, and validate
   every ship input gate.
2. Require `purpose_pass`, `skill_eval_pass`, and `composition_ok` or the
   narrowly permitted technical skip to name that exact hash. Any draft edit
   invalidates all three artifacts. Re-run the repository verdict helper against
   the supplied run summary, externally supplied draft/baseline paths, and
   evidence workspace; require the recomputed terminal
   result to be `skill_eval_pass`. A declared PASS payload is never sufficient.
   These are inputs; do not invoke the sibling skills in ship mode.
3. Reject `skill_eval_fail`, `no_lift`, `inconclusive`, an unverified declared
   result, a verifier mismatch, `composition_fail`, a stale hash, or incomplete
   evidence with `ship_gate_failed`.
4. If the destination exists, require the fresh `ship_replace: true` approval.
5. Copy the draft into a fresh
   `.skill-proposals/.ship-staging/<run-id>/<skill_name>/` directory and hash
   it. Snapshot `skills/INDEX.md` and `README.md` into the run-specific backup
   before any canonical mutation. Stop if the staged hash differs from the
   approved draft hash.
6. Replace the destination exactly; never overlay-copy. For replacement, move
   the current destination first to a run-specific recoverable backup under
   `.skill-proposals/.ship-backups/`. Move the verified staging directory into
   `skills/<skill_name>/`, then hash the destination. Any post-mutation copy,
   hash, or documentation failure enters the single rollback procedure in step
   8; never return early from an individual failure branch.
7. Update `skills/INDEX.md` and the README Meta list from the shipped
   description.
8. Delete the recoverable backup and proposal only after the destination hash
   and both documentation updates succeed. Unified rollback for every earlier
   post-mutation failure: remove the attempted destination, restore the prior
   destination when present, leave it absent for a first-time ship, restore
   both documentation files byte-for-byte, verify the exact pre-ship
   destination/documentation state, and preserve the draft. Successful
   rollback returns `ship_gate_failed`. Failed rollback returns the typed
   `rollback_failed` result with exact residual paths/state and manual recovery
   steps; never hide partial state behind an ordinary gate failure.

## Results

Draft success:

```yaml
result: draft_created
draft:
  path: <repo_root>/.skill-proposals/<skill_name>
  content_sha256: <current package hash>
  replaced_proposal: true | false
```

Ship success:

```yaml
result: shipped
skill:
  path: <repo_root>/skills/<skill_name>
  content_sha256: <approved package hash>
purpose: <purpose_pass payload with matching hash>
evaluation: <skill_eval_pass payload with matching hash>
composition: <composition_ok payload>
# Or, only for an explicit human skip:
composition_skip:
  by: human
  skill: <skill_name>
  reason: <human reason>
  blocked_evidence: <technical skill-composition blocked payload>
```

Failure:

```yaml
result: blocked
blocked:
  code: repo_root_missing | missing_dependency | invalid_input | collision | validation_failed | ship_gate_failed | rollback_failed
  missing_dependencies: []
  collision:
    kind: proposal | shipped | both
    paths: []
  required_action: ...
  residual_state: [] # required for rollback_failed
  recovery_steps: [] # required for rollback_failed
```

## Validation

- Draft input is complete and selected before any write.
- Draft mode writes only the authorized proposal, including behavior and
  trigger eval definitions without fabricated results.
- Methodology draft calls `methodology-skill-creator` directly and never calls
  `loop-orchestrator`.
- Replacement content validates before an existing proposal changes.
- Purpose, evaluation, and composition evidence names the exact current draft
  hash; fresh shipped-target replacement approval is present when required.
- Ship uses an exact staged replacement, rehashes the destination, leaves no
  destination-only stale file, failure-injects new/replacement rollback in an
  isolated fixture, and deletes the draft/backup only after package and both
  documentation updates succeed.

## Boundaries

- Do not perform intake or invoke `skill-brief`.
- Do not select a path or invoke `skill-path-selector`.
- Do not select a methodology or absorb `methodology-selector`.
- Do not judge purpose or invoke `skill-review`.
- Do not run behavioral evaluation or invoke `skill-eval`; use its deterministic
  validators in draft mode and revalidate its hashed evidence in ship
  mode.
- Do not invoke `skill-composition`; require its artifact in ship mode.
- Do not write `skills/<name>/` in draft mode.
- Do not commit, push, install globally, or edit files outside the repository.

## Human review and stop

Human approval is required before replacing a proposal, creating a replacement
draft for a shipped name, replacing a shipped package, technically skipping a
blocked composition check, or shipping. `composition_fail` cannot be skipped.

Stop after one draft, one ship, or one blocked result.
