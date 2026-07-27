---
name: workflow-step-record
description: Capture one step of the personal design-review-implementation-PR workflow as a two-phase, immutable evidence record. Use `start` immediately before task-groundwork, to-spec, adversarial-spec-review, revise-spec-from-review, spec-readiness, senior-implementer, commit-work, pr-branch, or adversarial-diff-review; use `finish` in the same session before switching windows. Never runs the target skill, judges its work independently, syncs Git, ranks models, or edits another skill.
---

# Workflow Step Record

Preserve the exact input before a workflow skill can change it, then bind the
skill's output and structured receipt to that input. This is an evidence
recorder, not an orchestrator or reviewer.

Read [README.md](README.md) when the user needs installation, storage,
security, SSD-use, or first-run guidance.
Read [references/record-contract.md](references/record-contract.md) before
creating a record.

## Configuration

No setup is required for local use. The recorder creates
`~/workflow-records` on first use.

Only when the user explicitly chooses another location, configure it once:

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs configure /absolute/records/root
```

This writes the choice to
`~/.config/workflow-step-record/config.json`. Do not require an environment
variable on every terminal. `WORKFLOW_RECORDS_ROOT` is only an optional
temporary or automation override. Show the effective location with:

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs config
```

## Start

Run `start` in the target skill's session before invoking the target skill:

Resolve the absolute directory containing this `SKILL.md`. Keep the target
product repository as the working directory and replace the example skill path
below with that resolved directory. Use an absolute input path:

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs start /absolute/start.json
```

The agent, not the human, prepares the transient JSON payload from the exact
task context and artifact locations. Never ask the user to hand-write the
contract. Keep transient payloads outside the product artifacts and remove
only those known temporary files after the command completes.

Use the exact artifact supplied to the target skill. Do not reconstruct an
earlier input from memory. Preserve the returned `run_id`.

If start fails, do not run the target skill under the claim that it is being
recorded.

## Run the target skill

Invoke the named workflow skill normally. This recorder does not call it,
wrap it, or alter its authority.

## Finish

Before changing sessions, snapshot the exact output and finish the same run:

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs finish RUN_ID /absolute/finish.json
```

Build the receipt from the current output:

- adversarial reviews: preserve the current verdict line, coverage, and
  current finding IDs/severities;
- spec readiness: preserve `READY` or `NOT READY` plus the current blocker
  count;
- other steps: preserve `completed` or `blocked` plus explicit evidence.

The receipt is an agent observation bound to the full output snapshot. It is
not independent proof that the output was interpreted correctly.

## Status

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs status RUN_ID [ABSOLUTE_RECORDS_ROOT]
```

`pending` means a start exists without a finish. Never silently classify,
delete, retry, or complete a pending run.

## Storage

Storage resolution is: per-run `records_root`, optional
`WORKFLOW_RECORDS_ROOT` override, saved config, then `~/workflow-records`.
The directory can be local, a private Git worktree, or a user-managed
Drive/iCloud location. Git is not required.

When a Git remote is detected the recorder returns `sync_required: true`.
It never runs `git add`, commit, pull, or push. Drive/iCloud synchronization
also remains outside the recorder.

## Stop boundaries

- Do not run or schedule the target skill.
- Do not repair missing artifacts or ambiguous receipts.
- Do not rank a model or infer that a model caused an observation.
- Do not update a skill, playbook, memory, or pattern catalog.
- Do not treat a recorded `pass` as merge or deployment permission.
- Do not bypass secret, size, symlink, mutation, or collision failures.
