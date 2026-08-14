# Codex transport envelope

This contract keeps authority and workflow state out of conversation memory.
The parent transports exact files and hashes; it does not add a semantic
summary, fix recipe, scope interpretation, or verdict hint.

## Durable layout

Use one stable spec ID allocated before groundwork:

```text
.workflow/<spec-id>/
├── state/
│   ├── checkpoint-vNNNN.json
│   └── CURRENT
├── packets/packet-vNNNN/
│   ├── artifacts/
│   └── manifest.sha256
├── authority/
│   ├── task.md
│   ├── groundwork-vNNNN.md
│   ├── groundwork-status-vNNNN.md
│   ├── outcome-lock-vNNNN.md
│   ├── question-resolution-vNNNN.json
│   └── resolution-set-vNNNN.md
├── evidence/
│   ├── groundwork-inventory-vNNNN.md
│   ├── scanner-inventory-vNNNN.md
│   ├── evidence-set-vNNNN.md
│   ├── prior-review-evidence-vNNNN.md
│   ├── review-seed-vNNNN.md
│   └── spec-manifest-vNNNN.sha256
├── dispatches/<dispatch-id>.envelope.txt
├── dispatches/<dispatch-id>.return.txt
├── receipts/closure-vNNNN.md
└── reviews/<commit-sha>/<packet-hash>-<role>.md
```

`NNNN` is decimal padded to at least four digits; it has no numeric ceiling.
Except for `CURRENT` and the live four-file spec cluster, every protocol file is
immutable. Packets are read-only after sealing and are never staged.

## Hashes and bindings

Packet manifests contain one bytewise-sorted line per file below `artifacts/`:

```text
<64 lowercase SHA-256><two spaces>artifacts/<relative-path>
```

The packet hash is SHA-256 of the exact manifest bytes. A binding is:

```json
{
  "path": "/absolute/path",
  "sha256": "<64 lowercase hex>",
  "packet_sha256": "<64 lowercase packet hash or null>"
}
```

Every child verifies its packet manifest and named bindings before work. A
missing or mismatched file is `BLOCKED`; it is not reconstructed from prose.

A spec manifest contains exactly four bytewise-sorted lines:

```text
<SHA-256><two spaces>plan.md
<SHA-256><two spaces>references.md
<SHA-256><two spaces>shape.md
<SHA-256><two spaces>standards.md
```

A rewrite packet carries both complete reports through one small manifest:

```text
Report set
Adversarial: artifacts/reports/adversarial.md | sha256:<hash>
Readiness: artifacts/reports/readiness.md | sha256:<hash>
```

## Evidence artifacts

Groundwork and scanner inventories use:

```text
Path: <repository-relative path>
Role: <why this source can change a decision>
Blob: <full lowercase Git blob hash>
State: committed | dirty | untracked
Reason: <direct dependency reason; scanner only>
```

Use `none` when empty; otherwise sort by path and do not repeat a path. Dirty,
untracked, or basis-mismatched decision evidence blocks the adapter.

An Evidence set points to packet-local inventory copies:

```text
Evidence set
Groundwork: artifacts/evidence/groundwork-inventory.md | sha256:<hash>
Scanner: none
Prior reviewer: none
```

Replace optional `none` values when those artifacts exist. A review seed is the
mechanical union of groundwork, scanner, author, and prior-reviewer additions:

```text
Review seed
Evidence: <path> | <blob> | <source role> | <exact reason or none>
```

Sort complete lines bytewise and remove only byte-identical duplicates. A path
with conflicting blobs is `BLOCKED`; the parent does not choose one.

Author and reviewer additions use exactly:

```text
Evidence addition: <repository-relative path> | <full Git blob hash> | <reason>
```

Path and reason are single-line and may not contain ` | `. Only direct
load-bearing committed dependencies belong here.

## Child envelope

Send plain text with only applicable fields in this order:

```text
Adapter: codex-task-to-spec
Stage: <task-groundwork | evidence-scan | to-spec | commit | adversarial-review | readiness-review | resolution-check>
Dispatch: <stable id>
Role: <fixed runtime role>
Model: <exact model id>
Effort: <exact effort>
Fork turns: none
Spec id: <stable spec-id>
Packet manifest: <absolute path> | sha256:<packet hash>
Repository root: <absolute path>
Repository head: <full Git SHA>
Task: <packet-local path> | sha256:<hash>
Lock: <packet-local path> | sha256:<hash>
Evidence: <packet-local evidence-set or review-seed path> | sha256:<hash>
Spec: <packet-local spec-manifest path> | sha256:<hash>
Reports: none | <packet-local report-set path> | sha256:<hash>
Authority resolutions: none | <packet-local resolution-set path> | sha256:<hash>
Question resolution: none | <packet-local current resolution path> | sha256:<hash>
Review commit: <full SHA>
Detached worktree: <absolute read-only path>
Spec root: <absolute live spec root>
Groundwork artifact: <absolute versioned output>
Lock artifact: <absolute versioned output>
Groundwork status: <absolute versioned output>
Evidence inventory: <absolute versioned output>
Scanner inventory: <absolute versioned output>
Closure receipt: <absolute versioned output>
Mutation: <stage-specific allowlist or forbidden>
```

Groundwork receives its four output paths. Scanner receives only its inventory
output. Normal `to-spec` receives the writable spec root and receipt; receipt
refresh uses `Mutation: receipt-only; spec forbidden`. Commit receives the spec
manifest/root and exact four-path allowlist. Reviewers receive review seed,
spec, SHA, and detached worktree with `Mutation: forbidden`; they do not receive
the closure receipt. Resolution-check receives the current question resolution,
prior resolution set, and the originating stage's read-only inputs.

## Compaction checkpoint

`CURRENT` contains:

```text
checkpoint-vNNNN.json  <SHA-256 of exact checkpoint bytes>
```

Each canonical JSON checkpoint records at least:

```json
{
  "schema": "codex-task-to-spec/checkpoint-v1",
  "sequence": 1,
  "spec_id": "<stable id>",
  "repository": {
    "root": "/absolute/path",
    "branch": "<branch>",
    "expected_head": "<full SHA>",
    "staged_diff_sha256": "<hash>"
  },
  "task": "<binding>",
  "packet": "<manifest binding>",
  "next_action": "<state>",
  "artifacts": [],
  "active_dispatches": [],
  "retries": {
    "receipt": 0,
    "adversarial": 0,
    "readiness": 0
  },
  "question": null,
  "gate": null
}
```

Bindings in `artifacts` are named and bytewise sorted. An active dispatch
records dispatch ID, role, model, effort, `fork_turns: none`, packet hash,
status (`planned`, `running`, or `returned`), host agent ID, envelope binding,
and returned-output binding. Reviewer/receipt retry values are only `0` or `1`
and stay bound to the same packet/SHA across compaction.

`next_action` is one of the named stages in `SKILL.md`, including
`AWAIT_DISPATCH`, `WAIT_FOR_OWNER`, `RUN_REVIEW_GATE`, `STOP`, and `BLOCKED`.
Before resuming, the parent recomputes the repository and artifact hashes and
runs `validate-checkpoint`. It then applies only `next_action`; no predecessor
graph or conversation reconstruction is required.

## Question and resolution authority

Question extraction is mechanical: exactly one non-empty single-line
`Question:`; the complete immutable return bytes are evidence. Store the exact
question, evidence, owner answers, source role/stage/dispatch, and basis packet
in canonical JSON:

```json
{
  "schema": "codex-task-to-spec/question-resolution-v1",
  "owner_role": "<role>",
  "source_dispatch_id": "<id>",
  "source_stage": "<stage>",
  "source_mutation": "<mutation>",
  "calling_phase": "task-groundwork | to-spec | commit | review-stage",
  "basis_packet_sha256": "<packet hash>",
  "question": "<exact question>",
  "evidence": "<exact complete return>",
  "owner_answers": ["<exact complete answer>"]
}
```

For an incomplete answer, create a new version appending the next exact answer.
Completed resolutions are cumulative:

```text
Resolution set
Resolution: artifacts/authority/question-resolution-vNNNN.json | sha256:<hash>
```

Append in version order and include the set plus every listed JSON in all later
packets. This is how fresh contexts see owner decisions.

The resolution owner returns exactly four lines:

```text
Resolved: yes | no
Lock: changed | unchanged
Resume: task-groundwork | to-spec | commit | review-stage
Basis: <packet-local resolution path> | sha256:<hash>
```

The validator checks the four-line grammar and exact Basis bytes. `Lock:
changed` always resumes groundwork. A new resolution invalidates downstream
receipts, commits, and verdicts; receipt refresh is required before later phases.

## Closure receipt

The adapter receipt is outside the four-file cluster:

```text
Closure receipt
Basis:
Packet: <path> | sha256:<hash>
Task: <path> | sha256:<hash>
Lock: <path> | sha256:<hash>
Authority resolutions: none | <path> | sha256:<hash>
Reports:
- none
Spec:
- <shape.md> | sha256:<hash>
- <plan.md> | sha256:<hash>
- <references.md> | sha256:<hash>
- <standards.md> | sha256:<hash>

Grounded coverage:
<existing obligation or heading>
→ <spec heading>
→ <producer>
→ <consumer/effect>
→ <failure/retry result>
→ <distinguishing proof>

Review roots:
none

Evidence additions:
none
```

On rewrite, list both reports and copy every current `[P0]`, `[P1]`, `[P2]`,
`[P3]`, and `[Blocker]` heading, each immediately followed by exactly one
`accepted:` or `refuted:` line. Use existing headings, not K1/K2 classes or
invented IDs. The receipt is not a PASS and is never sent to reviewers.

## Reviewer identity and gate

Both reports use:

```text
Basis: full; commit-sha=<full SHA>; packet-sha256=<packet hash>; <reviewer detail>
```

Valid verdict/Next pairs are:

```text
PASS      → Next: review-stage gate
FAIL      → Next: to-spec | wait for answer
READY     → Next: review-stage gate
NOT READY → Next: to-spec | wait for answer
```

Any other pair is malformed. Gate priority is fixed: malformed/hash mismatch →
`INVALID`; any question/wait → `WAIT_FOR_OWNER`; FAIL or NOT READY →
`ROOT_COMPLETE_REWRITE`; only PASS plus READY on the same SHA/packet → `STOP`.
