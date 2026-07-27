# Workflow Step Record Contract

## Lifecycle

One run has two immutable files:

```text
start → pending
finish → complete
```

`start` must happen before the target skill. `finish` must happen after the
target skill and before switching sessions. A pending run remains pending
until a human returns with the exact output.

## Commands

```bash
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs start /absolute/start.json
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs finish RUN_ID /absolute/finish.json
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs status RUN_ID [ABSOLUTE_RECORDS_ROOT]
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs configure /absolute/records/root
node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs config
```

Replace `/absolute/path/to/workflow-step-record` with the absolute directory
containing the recorder's `SKILL.md`. Commands run from the target product
repository; JSON input paths are absolute.
Successful commands emit JSON and exit zero. Usage errors exit one. Contract,
artifact, tool, and persistence failures exit two.
`status` validates the canonical documents and all linked artifacts before it
returns only `pending` or `complete` plus the applicable file paths.

`configure` creates the selected records directory when needed and saves it in
`~/.config/workflow-step-record/config.json`. `config` reports the effective
directory, its source, and whether manual Git synchronization was detected.

## Start input

```json
{
  "schema_version": 1,
  "records_root": "/optional/absolute/records/root",
  "project": {
    "id": "stable-project-id",
    "repo_root": "/absolute/product/repository/root"
  },
  "task": {
    "roadmap_path": "repo/relative/roadmap.md",
    "task_number": "3.2"
  },
  "step": {
    "skill": "one canonical workflow skill",
    "session_type": "design | review | implementation | commit-pr",
    "attempt": 1
  },
  "session": {
    "surface": "actual surface or unknown",
    "model": "actual model or unknown"
  },
  "input_sources": [
    {
      "kind": "canonical artifact kind",
      "source_type": "inline | file | directory | git-state | commits | pr",
      "locator": "content, repo-relative path, commit list, or PR number"
    }
  ]
}
```

The records root is selected in this order:

1. `records_root` in this one start/finish payload;
2. `WORKFLOW_RECORDS_ROOT` as an optional process-local override;
3. the saved user config;
4. `~/workflow-records`, created automatically.

The directory does not have to be a Git repository. A private Git worktree,
iCloud Drive, Google Drive, or another user-managed location may be selected
once with `configure`. If a per-run root is used instead of the saved root,
the matching finish/status operation must resolve the same directory.

The product repository may have no remote; its repository locator then becomes
`unknown`.

## Finish input

```json
{
  "records_root": "/optional/absolute/records/root",
  "output_sources": [],
  "receipt": {},
  "observations": [
    {
      "category": "input-gap | handoff-loss | skill-behavior | model-behavior | tool-limit | ownership-drift | manual-workaround | review-defect",
      "summary": "Observed behavior",
      "evidence": ["Exact evidence"],
      "workaround": "Optional manual action"
    }
  ],
  "next": {
    "session_type": "design | review | implementation | commit-pr",
    "skill": "next skill or human-action",
    "input_reference": "exact artifact to carry"
  }
}
```

## Artifact matrix

| Skill | Session | Required start | Required finish |
|---|---|---|---|
| `task-groundwork` | design | `roadmap-task` | `groundwork-output`; optional changed `roadmap-task` |
| `to-spec` | design | `groundwork-output` | `spec-cluster` |
| `adversarial-spec-review` | review | `spec-cluster` | `review-output` |
| `revise-spec-from-review` | design | `spec-cluster` + `review-output` or `readiness-output` + `task-context` | `spec-cluster` |
| `spec-readiness` | review | `spec-cluster` | `readiness-output` |
| `senior-implementer` | implementation | `spec-cluster` | `git-state` |
| `commit-work` | commit-pr | `git-state` | `commits` |
| `pr-branch` | commit-pr | `commits` | `pr` |
| `adversarial-diff-review` | review | `pr` + `task-context` or `spec-cluster` | `diff-review-output` |

When a target skill stops without its normal finish artifact, finish requires
an inline or file-backed `blocked-output` plus a completion receipt containing
`status: blocked`, evidence, and `blocked_reason`. Normal output kinds may be
included when they exist, but are not invented merely to close the record.

Source types are fixed:

- inline or file: groundwork, review, readiness, task context, diff review;
- directory: spec cluster;
- file: roadmap task;
- Git adapters: Git state, commits, and PR.

Read-only review inputs are recaptured at finish. A changed spec, task
definition, or PR head fails with `input-mutated-during-run`.

## Receipts and derived result

Adversarial review:

```json
{
  "kind": "adversarial-review",
  "verdict_line": "Current verdict",
  "coverage": "complete",
  "current_findings": [{ "id": "F1", "severity": "P1" }],
  "blocked_reason": "optional"
}
```

Blocked reason wins, partial coverage produces `incomplete`, a current P0/P1
produces `fail`, and otherwise the result is `pass`.

Readiness:

```json
{
  "kind": "readiness",
  "verdict_line": "READY",
  "blocker_count": 0
}
```

Only `READY` with zero blockers passes. `NOT READY` requires at least one
blocker. Any contradiction fails with `ambiguous-verdict`.

Completion:

```json
{
  "kind": "completion",
  "status": "completed",
  "evidence": ["Exact artifact or validation evidence"],
  "blocked_reason": "required only when blocked"
}
```

The core validates receipt consistency. It does not independently prove that
the agent extracted the receipt correctly from prose.

## Identity and storage

`run_id` hashes the canonical start payload. Stable `project.id`, not a
protocol-specific Git remote URL, identifies the project. `record_id` hashes
the canonical finish payload including `run_id`. Timestamps, repository
locators, local absolute paths, and the records root are excluded. Git and PR
artifact metadata use a protocol-independent repository identity where one is
needed.

```text
<records-root>/
├── artifacts/sha256/<artifact-digest>/
└── projects/<project-id>/tasks/<task-number>/
    ├── attempts/<skill>-<attempt>.json
    └── runs/<run-id-without-prefix>/
        ├── start.json
        └── record.json
```

Metadata strings use Unicode NFC and LF line endings. JSON keys and manifest
paths have deterministic byte order. Artifact bytes are never normalized.
Start and record files also carry a checksum over their complete canonical
content, including non-identity runtime metadata and the first timestamp.

The same identity is idempotent. The first timestamp survives. A different
identity for the same skill attempt, or different content at a canonical path,
is a collision. A task-local `attempts/<skill>-<attempt>.json` reservation
enforces that rule across concurrent writers.

When the selected directory is part of a Git worktree with an `origin` remote,
start/finish return `sync_required: true`. This is advisory only: pull, add,
commit, and push remain human actions. Non-Git storage returns false; a
Drive/iCloud client manages its own synchronization.

## Safety limits

- 10 MiB per file;
- 50 MiB across one run's input and output;
- 2,000 files per snapshot;
- no symlinks or paths outside the product/records roots;
- ignored Git files are excluded;
- publication is exclusive and never overwrites a canonical file.

Files, directories, and Git state are captured twice and must match. A source
that changes during capture fails with `input-mutated-during-capture`. PR
metadata retains its dedicated before/after head and base check.

The bounded detector checks artifact bytes, manifests, receipts, observations,
handoff metadata, and canonical documents. It blocks PEM private keys, known
GitHub/AWS/Slack/Stripe-style secret prefixes, long `sk-` secrets, and
credential-bearing remote URLs. It uses no entropy detector and makes no
general secret-free guarantee. Contract objects reject unknown fields instead
of preserving unchecked metadata.

On secret or limit failure, no artifact from that phase and no canonical
start/finish file is published. A failed finish leaves the start pending.

## Non-authority

Records never authorize another run, commit, push, merge, deployment, skill
change, model ranking, or pattern conclusion.
