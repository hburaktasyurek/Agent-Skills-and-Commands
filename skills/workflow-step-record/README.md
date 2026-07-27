# Workflow Step Record

`workflow-step-record` is a manual flight recorder for the stable
design-review-implementation-PR workflow. It preserves what one workflow skill
received, what it produced, which surface/model ran it, what went wrong, and
what must be handed to the next session.

It does not run the workflow skill, watch sessions in the background, judge the
work again, change another skill, or choose a model.

## Why use it?

Suppose `to-spec` drops the same kind of acceptance criterion in three
different tasks. Memory alone cannot show whether that is a recurring skill
problem. A recorded run keeps the exact groundwork input, resulting spec
cluster, model/surface, observation, and next handoff so the later decision can
be based on evidence.

Recording is selective. Use it for experiments, failed handoffs, review
failures, manual workarounds, and steps that may contribute evidence to a skill
improvement. It does not need to record every step of every task.

## Installation

Install this skill for all agents supported by `npx skills`:

```bash
npx skills@latest add hburaktasyurek/Agent-Skills-and-Commands/skills/workflow-step-record -g --all
```

The recorder uses Node.js and a terminal-capable agent. Its data format is the
same across Codex, Claude Code, Cursor, and other compatible agents. The
surface and model are recorded as metadata; they do not change the storage
engine.

## Storage with no setup

No environment variable is required. On first use, the recorder creates:

```text
~/workflow-records
```

This local default is not automatically uploaded or synchronized.

## Choose a synchronized folder once

To keep the records in a private Git repository, iCloud Drive, Google Drive,
or another synchronized directory, tell the agent:

> Configure workflow-step-record to use
> `/absolute/path/to/my/workflow-records`.

The agent runs this command once:

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs \
  configure /absolute/path/to/my/workflow-records
```

The choice is saved in:

```text
~/.config/workflow-step-record/config.json
```

Every later Codex, Claude Code, or Cursor session reads that file. There is no
per-terminal `export` step. Show the active choice with:

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs config
```

Storage selection follows this order:

1. `records_root` supplied for one run;
2. `WORKFLOW_RECORDS_ROOT` as an optional temporary/automation override;
3. the saved config;
4. the automatic `~/workflow-records` default.

Git is optional. When the chosen directory belongs to a Git worktree with an
`origin` remote, results report `sync_required: true`; the recorder still does
not pull, commit, or push. A Drive/iCloud client handles its own sync.
Do not use the same cloud-synchronized directory concurrently on two
computers.

## Record one step

The human should not hand-write recorder JSON. Invoke the skill in the same
session that will run the target workflow skill and give it the normal task
context. The agent prepares the transient start/finish payloads from the exact
artifacts.

Before the target skill:

> Start a workflow-step-record for task 3.2, `to-spec`, attempt 1. The input is
> the groundwork output at `/absolute/path/to/groundwork.md`.

The recorder returns a `run_id`. Then run `to-spec` normally.

Before switching sessions:

> Finish workflow-step-record run `sha256:...`. The output is the spec cluster
> at `/absolute/path/to/spec-folder`; the next step is
> `adversarial-spec-review`.

The lifecycle is:

```text
workflow-step-record start
        ↓
target workflow skill
        ↓
workflow-step-record finish
        ↓
switch sessions
```

A start without a finish remains `pending`. It is not silently deleted or
reported as a failed workflow step.

## SSD use and retention

Artifacts are content-addressed by SHA-256. Identical content is stored once,
even when several records refer to it. File-backed and Git sources are
captured twice to detect content changing during capture, but the second
capture does not create a second stored copy.

Limits are 10 MiB per file, 50 MiB across one run, and 2,000 files per
snapshot. Git state and large PR patches are the main storage risk. Selective
recording is recommended; retention and deletion remain human decisions.

## Security boundary

The records can contain specs, diffs, reviews, and other private project
material. Keep the folder local or use a private synchronization target.

The bounded detector blocks several high-confidence private-key, GitHub, AWS,
Slack, Stripe, and OpenAI-style secret forms, credential-bearing remote URLs,
symlinks, traversal, oversized snapshots, and canonical overwrites. It is not
encryption and cannot guarantee that every possible secret is detected.

See [SKILL.md](SKILL.md) for agent instructions and
[references/record-contract.md](references/record-contract.md) for the exact
data contract.
