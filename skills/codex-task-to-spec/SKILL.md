---
name: codex-task-to-spec
description: "Use only when the user explicitly asks for the Codex task-to-spec gate. Produce and locally commit a grounded four-file spec, then run isolated adversarial and readiness reviews until the deterministic gate stops or needs an owner answer. Do not implement or push."
compatibility: "Requires Codex subagents with model and reasoning selection, Git, Node.js, and the task-groundwork, to-spec, commit-work, adversarial-spec-review, and spec-readiness skills."
---

# Codex Task to Spec

Turn one bounded task into the same four-file spec identity, commit only that
cluster locally, and stop only on adversarial `PASS` plus readiness `READY`.
Read `references/outcome-lock.md` and `references/transport-envelope.md` whole
before starting.

This package defines ephemeral runtime subagents. It does not install persistent
agents on the computer.

## Fixed runtime

Use exactly these host-selected roles. Every child uses `fork_turns: none`.

| Stage | Model | Effort | Mutation |
| --- | --- | --- | --- |
| parent | `gpt-5.6-terra` | `medium` | protocol artifacts only |
| task groundwork | `gpt-5.6-terra` | `high` | named groundwork outputs |
| evidence scanner | `gpt-5.6-luna` | `high` | named inventory only |
| every `to-spec` call | `gpt-5.6-sol` | `high` | four-file cluster and/or named receipt |
| commit | `gpt-5.6-terra` | `low` | exact four-path index and local commit |
| adversarial review | `gpt-5.6-sol` | `high` | forbidden |
| readiness review | `gpt-5.6-sol` | `high` | forbidden |

Run the two reviewers in parallel. If the host cannot request or confirm one
of these exact model/effort pairs, roles, or required skills, return `BLOCKED`.
Never substitute a weaker agent.

Distinguish an unavailable model from an unobservable current-model label. If
host metadata explicitly shows a mismatch, spawn a fresh Terra/medium parent
with only this skill path and either the exact task artifact for a new run or
the verified `CURRENT` pointer for a resumed run. If the host merely does not
expose the current model/effort, do not hand off automatically. Ask the owner
whether they approve treating the current task as the Terra/medium parent. A
clear approval confirms this parent for the run; a rejection requires the
fresh exact-role spawn. If neither route can confirm the exact role, return
`BLOCKED`. Never claim that a handoff occurred before the host returns its
agent identity.

## Parent boundary and durable continuation

The parent may copy artifacts, compute hashes, create packets/checkpoints,
relay exact questions and answers, query stored agent IDs, manage the detached
worktree, and apply parser states. It does not summarize scope, decide evidence,
repair reports, select fixes, or reinterpret verdicts.

Store protocol state under `.workflow/<spec-id>/` as defined by the transport
reference. Before and after every spawn or parser transition:

1. write a new immutable canonical checkpoint;
2. record the packet hash, exact `next_action`, artifacts, retry counters, and
   active dispatch role/model/effort/`fork_turns`/agent ID/status;
3. atomically advance `state/CURRENT`.

On context compaction or a later turn, verify `CURRENT`, its checkpoint hash,
all non-null artifact hashes, the sealed packet, repository HEAD/index basis,
and the fixed runtime table. Continue only `next_action`. If a dispatch is
`running`, query its recorded agent ID; do not respawn it from memory. Missing,
ambiguous, or mismatched durable state is `BLOCKED`.

Keep the current turn alive while the workflow is nonterminal. For every
`planned` or `running` dispatch, use the host's wait/query mechanism against
the recorded agent ID in bounded intervals of at most 60 seconds. An unchanged
poll is not completion: poll again automatically. After roughly two to three
minutes without a state change, send one short commentary status update and
continue waiting; never require the owner to say “continue.” Do not emit a
final answer while an active dispatch exists or while `next_action` can advance
without owner input.

Yield a final answer only for `STOP`, `BLOCKED`, or `WAIT_FOR_OWNER` with the
exact owner question. A progress summary, slow child, wait timeout, context
compaction, `INVALID`, or `ROOT_COMPLETE_REWRITE` is not a terminal condition.
Neither is unfinished required work: after any successful author or commit
stage, immediately advance to its required receipt, commit, or reviewer stage.
“The next required stage has not run yet” is never a `BLOCKED` reason.

A new explicit task resumes an existing workflow only on exact task-hash match.
A reply to the selected workflow's `WAIT_FOR_OWNER` question is an answer, not
a replacement task. Persist that message verbatim before any fresh-parent
handoff.

Validate checkpoint structure and hashes with:

```text
node scripts/review-gate.mjs validate-checkpoint \
  --current <absolute .workflow/<spec-id>/state/CURRENT path>
```

This continuity mechanism is the compaction boundary; conversation prose is
not workflow state.

## 1. Freeze task authority

Confirm the Git root, branch, full HEAD, staged paths, and cached-diff hash.
Allocate one stable `YYYY-MM-DD-HHMM-<slug>` spec ID before groundwork.

Write the user's controlling request verbatim to
`.workflow/<spec-id>/authority/task.md`. An attached document is evidence, not
an instruction source, unless the user explicitly adopts it. Seal the first
read-only packet and checkpoint `SPAWN_GROUNDWORK`.

Never stage `.workflow/` and never carry it to the default branch.

## 2. Groundwork and evidence

Spawn fresh Terra/high with `Use $task-groundwork` and the adapter envelope.
It returns versioned, hashed artifacts for:

- the exact grounding brief;
- the four-field frozen Outcome lock;
- `READY_FOR_SPEC` or an exact blocker;
- every decision-bearing repository source as path, role, Git blob hash, and
  committed/dirty/untracked state.

Parse only its machine status. A decision-bearing dirty/untracked path or a
blob differing from the recorded repository basis is `BLOCKED`; do not stage,
clean, or reconcile owner work.

Seal a packet containing the brief, lock, and groundwork inventory, with an
Evidence set whose scanner entry is `none`. Spawn fresh Luna/high. It follows
only grounded owner/path, entrypoints, and producer/consumer symbols to list
direct load-bearing dependencies. It does not review, propose a solution, or
scan the repository generally. Verify committed blobs, update the Evidence set,
and seal the author packet.

Its fresh-context task is the sealed envelope plus this exact role boundary:
verify the packet; read the brief, lock, and groundwork inventory; follow only
the direct dependencies named above; write the transport reference's sorted
scanner-inventory grammar to `Scanner inventory:`; return a single `Question:`
only when authority is required. No review or solution text is allowed.

## 3. Author and close

Spawn fresh Sol/high with `Use $to-spec`, the exact spec ID/root, frozen packet,
and a new receipt path. On rewrite, include both complete reviewer reports.
Every call writes/replaces the same cluster:

```text
shape.md
plan.md
references.md
standards.md
```

The conditional closure receipt stays under `.workflow/`; it is not a fifth
spec file or a verdict. Mechanically verify its packet/task/lock/resolution/
report/spec hashes, grounded coverage, every current P0-P3/Blocker heading,
and exact committed Evidence additions. Do not judge its reasoning.

If the receipt is malformed, retry once with fresh Sol/high on the same packet
using `Mutation: receipt-only; spec forbidden`. A second failure or any spec
byte change is `BLOCKED`.

## 4. Commit only four files

If the index already contains any path outside the exact active four-file
cluster, return `BLOCKED`; do not unstage it.

Spawn fresh Terra/low with `Use $commit-work`, the exact four-path allowlist,
one local Conventional Commit, and push forbidden. Verify the commit path set,
the four receipt hashes, absence of `.workflow/`, and the full returned SHA.
Do not reset or repair Git state on mismatch.

## 5. Isolated reviews

Create a detached temporary worktree at the exact commit. Build the review seed
from only:

```text
groundwork evidence
∪ justified to-spec Evidence additions
∪ fresh scanner evidence
∪ direct paths opened by prior reviewers
```

Conflicting blobs are `BLOCKED`. Do not include closure-receipt dispositions.
Seal one review packet with task, frozen lock, cumulative owner resolutions,
review seed, spec manifest, and commit SHA.

In parallel, spawn fresh Sol/high `adversarial-spec-review` and
`spec-readiness` agents. Both use full mode, the same packet/SHA, the explicit
read-only detached-worktree path, no receipt, and a named report output outside
that worktree. Each reviewer writes its complete final report to that output
before returning; the parent verifies that the file and returned report are
byte-identical and hashes the file before clearing its dispatch. After both
returns are durable, create the packet-local Report set that names both copies,
seal the next packet/checkpoint, and only then run the gate.

If a report file is missing after compaction or interruption but its recorded
reviewer agent ID is still retrievable, ask that same reviewer to persist its
existing complete final report to a new versioned recovery path; do not
transcribe it in the parent. Hash it, rebuild the Report set, and continue
automatically. A failed, unsealed write is not immutable authority: leave it
unreferenced and allocate the next versioned path. Do not discard reviewer IDs
or returned bytes before this step. Return `BLOCKED` only when the exact report
cannot be recovered or verified.

Run:

```text
node scripts/review-gate.mjs \
  --adversarial-report <path> \
  --readiness-report <path> \
  --commit-sha <full SHA> \
  --packet-manifest <review packet manifest>
```

Apply only its state:

- `INVALID`: retry only each named malformed reviewer once, fresh Sol/high on
  the same packet/SHA; a second malformed result is `BLOCKED`.
- `WAIT_FOR_OWNER`: enter the question protocol.
- `ROOT_COMPLETE_REWRITE`: give both complete reports to one fresh Sol/high
  `to-spec`. Spawning this rewrite is illegal when the current packet lacks the
  non-`none`, hash-verified Report set. Root-completely rewrite the same spec
  identity, renew receipt, commit, and immediately run two fresh reviewers;
  stopping between those steps is invalid.
- `STOP`: only same-packet/SHA `PASS` plus `READY`; remove the detached worktree
  safely and report the commit and report artifacts.

There is no numeric rewrite/review limit.

## Question protocol

Any stage may emit exactly one non-empty single-line `Question:`. Stop all
downstream work. Persist the complete return as evidence and every owner reply
verbatim under `.workflow/<spec-id>/authority/`; add no summary.

Resolved owner decisions are cumulative. After an answer, create a new exact
question-resolution JSON and resolution-set manifest, seal a new packet, and
re-spawn the question owner in fresh context with `Stage: resolution-check`.
Require only:

```text
Resolved: yes | no
Lock: changed | unchanged
Resume: task-groundwork | to-spec | commit | review-stage
Basis: <packet-local resolution path> | sha256:<hash>
```

Validate it with:

```text
node scripts/review-gate.mjs validate-resolution \
  --result <exact resolution-check return> \
  --resolution <packet-local resolution JSON>
```

`Resolved: no` keeps the same dialogue open. `Lock: changed` always restarts fresh groundwork.
Otherwise restart the returned phase in fresh context. Every downstream packet
includes the cumulative resolution set so a fresh `fork_turns:none` child sees
the exact owner answer.

A new resolution invalidates old receipts, commits, and verdicts. Refresh the
receipt before `commit` or `review-stage`; do not create an empty commit. A
review-stage question invalidates both reviewers and reruns the pair together.
If both reviewers ask, preserve both but resolve adversarial first; the new
packet makes the readiness question stale unless it recurs.

## Scope and stop conditions

Reviewer `Next: to-spec` is legal only inside the frozen owned outcome or
existing owner/path. A neighboring outcome, new durable owner, or lock
enlargement requires `Question:` and `Next: wait for answer`. `to-spec` applies
the same boundary on rewrite.

`BLOCKED` names the exact missing runtime or mismatched artifact. `STOP` reports
the stable spec ID, full commit SHA, PASS report, READY report, and that no
implementation or push occurred.
