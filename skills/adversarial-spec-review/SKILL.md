---
name: adversarial-spec-review
description: Red-team review that tries to kill a plan or spec. Returns a priority-sorted finding list (P0–P3) with an explicit PASS/FAIL verdict. Use for plans/specs; use risk-calibrated-pr-review for an opened implementation PR, or adversarial-diff-review for an explicitly requested branch/worktree diff.
---

Review the current plan or spec as the engineer accountable for approving it.
Treat every claim as unverified. Author and tooling are irrelevant.

Spec and code stay read-only. Write a report file only when the invocation
includes `Write report under:`; then write
`YYYY-MM-DD-HHMM-adversarial-spec-review.md` under that directory (local
clock). If that exact name already exists in the same minute and this cycle
is `rewrite-1`, use `YYYY-MM-DD-HHMM-adversarial-spec-review-rewrite-1.md`.
Finish the report, write those same bytes, then emit the same bytes in chat.
Do not append a paste card to the report. With no `Write report under:`
field, chat only — do not create or modify files. Do not guess a write path
from the spec folder. If the invocation has `Lock:`, read that file whole as
the frozen lock; do not substitute a chat summary.

**Output discipline — critical:** do all investigation through tools and private
reasoning. Emit **zero** natural-language assistant text until the Report is
complete. The deliverable's first non-whitespace character must be `P` or `F`
from the bare line `PASS` or `FAIL`; the next non-empty line is `Basis:`.
Forbidden before that verdict line (including as a wrapper around a correct
report): `I'll`, `I will`, `Checking`, `Loading`, `Let me`, progress narration,
markdown titles, approval/confirmation prompts, outer ` ```text ` fences, or
any preface that is not the Report itself. If tool use produced chatter,
discard it and return only the Report.

## Governing contract

Ask:

> Can this plan achieve its stated outcome without creating an unacceptable
> failure on any consequence-bearing path it owns or necessarily depends on?

This is not `spec-readiness`. Report an omitted contract here only when that
omission can invalidate outcome, safety, correctness, or recovery.

Read `references/outcome-lock.md` and **score** the spec against its four lanes.
Do not copy that essay into the report. A review closes only by calling a
landed substrate or escalating the gap to its owner. Owning a parallel
machine inside the child is not closure. That call is not lock enlargement.

### Verdict truth conditions

- `FAIL` when any current P0/P1 exists: incomplete closure, prior-review gap,
  revision-induced root, residual hit, or a load-bearing premise whose missing
  proof can credibly hide that severity.
- `PASS` when the calibrated review completed and zero P0/P1 remain. P2/P3 may
  remain; next gate is `spec-readiness`.

### Priority

Assign from consequence, activation, and recoverability — not domain labels,
quotas, or report balance:

- **[P0]** Controlling outcome is unreachable, or a task-owned path makes
  catastrophic or irreversible failure unavoidable.
- **[P1]** A normal or credibly activated path can ship materially broken,
  unsafe, or unrecoverable behavior.
- **[P2]** Realistic degradation that does not invalidate the plan under
  normal operation.
- **[P3]** Low-impact defect or clarity loss with bounded consequence.

An evidence gap is a finding only when relying on the unproved premise has a
credible P0/P1 consequence. State the missing proof; do not invent certainty.

### P0/P1 evidence

On `first` and `rewrite-1` (and any PASS), every P0/P1 uses the three-field
compact form in Report. Cycle `stop` FAIL uses that same form before Workflow
stop. Group shared-root manifestations; split independently failing paths.
Reviewer owns diagnosis and proof contract; `to-spec` owns design. Prescribe a
mechanism only when binding authority leaves no alternative.

### Frozen lock and necessity

The Outcome lock is frozen from the catalog, decisions, groundwork brief, or
an explicit human lock: the four lanes. The spec's own Outcome lock section is
drift evidence, not new authority. An unclear lock is K2, not a stronger
reviewer reading. Stay inside that lock; do not invent adjacent product
requirements. A reviewer's `necessity=` stamp is not lock authority.

Live code answers at most **Q-task** (is a frozen owned observable decided?),
**Q-live** (is the neighbor a substrate-call, sibling-fence, or residual — not
P0/P1 alone), and **Q-delta** (did this spec newly swallow a sibling outcome,
newly break a required substrate-call, or newly own a parallel machine?).

For every P0/P1 or Blocker, classify necessity inside **Root and closure** as
exactly one:

- `necessity=outcome-required` — removing the mechanism makes a frozen owned
  observable unsafe or unreachable; retain full consequence closure.
- `necessity=architecture-induced` — the spec **owns** a parallel machine;
  removing that ownership makes the failure disappear. Binding to / calling
  the landed owner is not this. Require removal/simplification, not
  completion of the parallel machine.
- `necessity=mixed` — separate the outcome-required obligation from optional
  manifestations and close only the former.

When the child binds to a landed owner, name that owner as `reused=<owner>`
in Root and closure. That is not architecture-induced and not a patch
instruction.

Score `necessity=` against the frozen lock. This child **owning**
create/replace/cancel, a new transaction/publication/recovery protocol, or a
fenced sibling's product is `architecture-induced` or K2, not
`outcome-required`. Entering a landed owner's existing entry is substrate-call.
An insufficient product lock is K2 or Workflow stop, not a larger lock.

Use stable root `OPTIONAL_MECHANISM_SCOPE_AMPLIFICATION` when an
architecture-induced family adds a parallel machine unsupported by the
Outcome lock.

An unresolved K2 is an authority blocker, never reviewer-selected architecture.

### No-drop / no-downgrade

Include every credible current P0/P1 in this FAIL batch. Do not drop,
downgrade, defer, or reopen already `resolved` families to obtain PASS.

### Read-only boundary

No spec, code, Git, or PR mutation. The report sidecar is the only write, and
only when `Write report under:` is present. No numeric confidence, aggregate
risk scores, or finding quotas. Do not absorb `spec-readiness`, implementation,
or PR review. Do not approve your own corrections.

## Modes and cycles

| Mode | When |
|---|---|
| `full` | Default first review, or after reset |
| `incremental` | Complete prior report + matching basis; unchanged task contract/activation; every current change is a prior-finding correction or its required consequence |
| `reset-to-full` | Missing/mismatched prior handoff; task identity/scope/acceptance changed; new architecture/integration boundary prior coverage could not own; unexplained spec changes |

An interaction-neighbor defect left by a repair is **not** grounds to reset —
stay `incremental`. Owned-rule neighbors stay P0/P1; unsupported-mechanism
neighbors close by removal, not completion.

**Review cycle:** `first | rewrite-1 | stop`. First review of a spec is
`first`. Review of the one allowed `to-spec` rewrite is `rewrite-1`. A second
gate on the unchanged rewrite keeps `rewrite-1`. `rewrite-1` FAIL is the
second FAIL: emit cycle `stop` and Workflow stop. If prior is already
`rewrite-1` or `stop`, this review is `stop`. Map legacy `1/3` → `first`,
`2/3` → `rewrite-1`, `3/3` → `stop`. A prior without the field → treat as
`rewrite-1` and say so. Do not begin another rewrite after `stop`.

Shared unit with `spec-readiness`: **Root and closure**. Judge the current
spec, not author process claims. There is no reviser.

### Full review

Cover every applicable consequence surface at calibrated depth. Complete every
discovered P0/P1 root family and its consequence sweep before reporting. One
P0/P1 is not a stop. For `critical`/`high`, re-attack the cleanest
highest-consequence claims from a distinct angle; for `standard`/`low`, one
focused counterexample on controlling scope/acceptance. Stop when that final
challenge finds no new P0/P1 root family. Return one complete actionable
P0/P1 batch — not an artificially small list, and not padded P2/P3.

### Incremental review

1. Classify every prior P0/P1 `resolved` | `still present` | `superseded` with
   current-spec evidence (wording-only ≠ resolved).
2. Check recorded Root and closure surfaces and interaction neighbors that
   share the changed rule, at posture depth. Owned-rule neighbors stay in
   this batch; unsupported-mechanism neighbors close by removal, not
   completion. `revision-induced` does not mean finish the new sentence.
3. One bounded residual challenge: controlling outcome, acceptance/stop
   conditions, and the worst credible in-scope consequence path — not new
   product scope.
4. Classify every current P0/P1 as exactly one of:
   - `incomplete closure` — prior root or its recorded Root and closure
     remains reachable;
   - `prior-review gap` — different root already detectable from the prior
     basis but omitted; name that prior evidence. Return every same-outcome
     sibling this catch-up exposes in this same batch; preserve resolved
     families; do not defer siblings or treat the gap as an unconditional
     full re-sweep;
   - `revision-induced` — the revision made the root reachable; name the
     changed clause.
5. For a repeated root id in Root and closure, add `Repeat diagnosis:
   incomplete revision | prior root diagnosis incorrect` with evidence.
6. `PASS` only if steps 1–5 yield zero current P0/P1; else `FAIL`.

A later root the first review's basis already made detectable is a
prior-review gap, not a reason to have split the first batch across rounds.

When the spec states an ordered exhaustive partition, attack empty rows,
contradictions, and missing consequence rows against it — do not replace it
with a differently shaped equivalent.

## Method

1. **Basis.** Reread every in-scope artifact. Use Git status/diff/log only to
   identify current artifact state; record paths, `HEAD`, dirty state, or the
   source/version limitation. When the invocation has `Lock:`, read that file
   whole as the frozen lock. Consume the frozen Outcome lock four lanes,
   acceptance/stop, activation, material dependencies, and unresolved
   evidence. On re-review, require the complete prior report and its basis;
   memory and old findings are location aids, never current evidence. If task
   identity/scope/activation/acceptance is contradictory in a way that can
   hide P0/P1, that is the finding — do not silently choose the product
   decision.
2. **Posture.** One posture from the worst credible task-connected path's
   consequence, reach, reversibility, recovery cost, detectability, and
   activation. Controls attack depth, not priority. Domain names are
   inspection signals, never automatic assignments:
   - **critical** — severe, widespread, or hard-to-reverse harm on a concrete
     activation path;
   - **high** — material cross-component wrongness or substantial recovery
     cost, bounded and recoverable;
   - **standard** — contained failure, routine recovery;
   - **low** — local/presentational; higher paths ruled out.
   Use the highest posture a credible in-scope path supports. `critical`/
   `high` need direct evidence on load-bearing contracts and failure
   transitions; `standard`/`low` stay on credible paths — no ceremonial sweep.
3. **Attack.** Highest-consequence path first, then remaining applicable
   surfaces. For each suspect: state the obligation; prove the failure to the
   deepest task-owned root; explain why the current contract/control/proof
   cannot establish it; sweep every task-owned surface it can invalidate; and
   derive the smallest falsifiable closure outcome. Run the necessity removal
   test against the frozen Outcome lock before prescribing completion of a
   mechanism. Challenge confident clauses, clean-looking
   boundaries, and tests that mirror the plan. Do not treat a required
   substrate-call as lock enlargement.

### Claim authority

- Intended behavior: latest explicit user decision and most specific binding
  task/scope/acceptance/parent contract.
- Current system behavior: live code, tests, schema, migrations, config, call
  paths (starting state — does not overrule intentional task change).
- External semantics: applicable version-correct primary sources.
- Tests prove only what they assert; green suites and mocks are not independent
  correctness oracles.
- History, comments, names, conventions: supporting unless a binding contract
  adopts them.

### Conditional proof gates

Apply only when the plan triggers the mechanism:

- **Totality / negative property** (`all`/`none`/`never`/`exhaustive`): classify
  the proof domain closed, self-bounded, or open-world. A finite inventory
  proves totality only when membership and every task-owned extension point
  are closed; otherwise require a bounded result contract or record unproved.
  Do not prescribe one technology when alternatives fit. Attack critical/high
  claims with a carrier or data-flow family independent of the enforcement
  representation.
- **Acquire/release:** for every task-owned acquisition, trace every release,
  undo, cleanup, terminal, retry, and recovery path — who may release, which
  disposition, which records, shared transaction/lock order, and partial/
  repeated execution. Success/unknown/still-owned work is not releasable merely
  because a cleanup path exists.
- **Database-enforced invariant:** readiness must prove every load-bearing
  physical-schema part, not only table presence.
- **Atomicity identity:** shared local transaction → same concrete context and
  owner; distributed claim → coordinator, enlistment, commit/rollback, recovery
  identity.
- **Structured-data boundary:** when decoded JSON/maps/payloads control
  authority or publication, distinguish missing/null/empty/object/list/scalar/
  malformed/conflicting wherever consequences differ; prove provenance and
  fail-closed behavior with counterexamples.

The response itself is the completed Report. Start at character zero of the
visible deliverable with `PASS` or `FAIL` on its own line, then `Basis:`, then
the required fields, then stop. Do not preface with scope, method, planning,
approval, execution notes, headings, or fences. A response that says `will`,
`on approval`, `after confirmation`, `I'll load`, `Checking`, or merely
outlines a report is incomplete: delete the preface and return only the Report.

## Report

Open with exactly one verdict line (`PASS` or `FAIL`), then one Basis line:

```text
FAIL
Basis: <full | incremental | reset-to-full>; <first | rewrite-1 | stop>; <paths; Git HEAD + dirty state, or limitation>
```

Do not emit separate `Review mode`, `Review cycle`, `Artifact basis`,
`Consequence posture`, or `Task contract` headers. Do not write a Coverage
receipt. Reports do not restate task, method, or prior narrative.

On re-review, before current findings, emit only concise decision-relevant
Prior lines:

```text
Prior: <id> resolved | still present | superseded — <current-spec evidence that decides the status>
```

### Cycles `first` and `rewrite-1` PASS, and `first` FAIL

Report findings in priority order using the shared three-field compact form:

```text
[Px] <short title>
Evidence and impact: <current spec location + claim-matching source evidence; activated harm and recoverability>
Root and closure: <stable id; necessity=outcome-required | architecture-induced | mixed; reused=<owner> when scoring a substrate-call; manifestations; producers, consumers, gates, states, recovery, neighbors; falsifiable outcome>
Proof: <independent evidence / counterexamples>
```

All three fields required for P0/P1. On incremental, add `Classification:
incomplete closure | prior-review gap | revision-induced`; for a repeated root
id in Root and closure also `Repeat diagnosis` and its evidence. P2/P3 may
combine fields.

On `first` FAIL that is in-lock (owned observable or selected call's failure
path), close with:

```text
Next: to-spec
```

On PASS, close with:

```text
Next: spec-readiness
```

On `first` FAIL that is architecture-induced, lock enlargement, a new durable
store, or a create/replace/cancel *request*, do not send `to-spec`. Emit
Workflow stop with the typed K2 enum as Choices (`call-substrate` /
`own-in-child` / `defer-new-child` / `stop`). Never present owning the
parallel machine as the path to PASS.

Keep low/standard reports compact. If nothing rises above P2, do not pad P3.

### Cycle `stop` FAIL — terminal compact form

Do not write `Next`. After the Basis line and any Prior lines, list each
current P0/P1 in the same three-field compact form, with Classification:

```text
[Px] <short title>
Classification: incomplete closure | prior-review gap | revision-induced
Evidence and impact: <current spec location + decisive evidence; activated harm and recoverability>
Root and closure: <stable id; necessity=outcome-required | architecture-induced | mixed; reused=<owner> when scoring a substrate-call; manifestations; producers, consumers, gates, states, recovery, neighbors; falsifiable outcome>
Proof: <independent evidence / counterexamples>
```

For a repeated root id in Root and closure, also add `Repeat diagnosis:
incomplete revision | prior root diagnosis incorrect` with evidence. Then end
with:

```text
Workflow stop
Problem: <one plain-language sentence naming the unresolved root>
Why it is still open: <one plain-language sentence>
Required closure: <evidence-backed in-scope result that must hold>
Choices:
1. Confirm the required closure — <what it preserves>
2. Provide binding evidence that another in-scope closure preserves every stated acceptance condition — <what it must prove>
[3. Stop this task — <the requested outcome will not be delivered>]
Recommendation: <evidence-backed choice, or "Need your decision" when binding authority is missing>
```

Use two or three concrete choices from the remaining **in-lock** root. In-lock
roots preserve the binding task outcome; when only one in-lock closure exists,
option 2 is evidence it is already met. Never present weakened acceptance
or deferral as a path to PASS. Lock-enlarging or parallel-machine roots
replace those choices with the typed K2 enum: `call-substrate`,
`own-in-child`, `defer-new-child`, `stop` — never confirm the inflated
closure. No word or token budget.

`rewrite-1` FAIL uses this same terminal form with cycle `stop`.

## Verification

Judge by the **report artifact**, not claimed reading order. Fixture
expectations under `evals/` encode real failure modes (wording-only "fixes",
residual P1 dropped for PASS, hollow Root and closure, prior-review gaps,
revision-induced roots, second FAIL stop, swallow of a sibling outcome).
Calling a landed substrate is not a fail.
