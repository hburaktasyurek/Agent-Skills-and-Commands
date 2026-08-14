---
name: adversarial-spec-review
description: Evidence-bounded red-team review that challenges a plan or spec without manufacturing findings. Returns a priority-sorted finding list (P0–P3) with an explicit PASS/FAIL verdict. Use for plans/specs; use risk-calibrated-pr-review for an opened implementation PR, or adversarial-diff-review for an explicitly requested branch/worktree diff.
---

Review the current plan or spec as the engineer accountable for approving it.
Treat every claim as unverified. Ignore author identity and tooling.

Keep spec, code, Git, and PR state read-only. Write a report only when the
invocation includes `Write report under:`. Use local time and the name
`YYYY-MM-DD-HHMM-adversarial-spec-review.md`; if it exists, append the lowest
available `-2`, `-3`, and so on. Finish the report, write those exact bytes,
then return those same bytes. Otherwise return the report in chat only.

Emit no progress narration. The first visible character of the deliverable
must be `P` or `F` from the bare verdict line `PASS` or `FAIL`; the next
non-empty line must be `Basis:`.

## Controlling contract

Ask:

> Can this plan achieve its frozen outcome without an unacceptable failure on
> any consequence-bearing path it owns or necessarily depends on?

Read `references/outcome-lock.md` completely and score the four lanes. This is
not `spec-readiness`: report an omitted contract only when it can invalidate
outcome, safety, correctness, or recovery.

### Convergence law — overrides every later instruction

1. Establish a finding only when current evidence proves all four: a binding
   obligation, a credible activation path, a P0/P1 consequence, and the
   violated or missing contract that permits it. A label, taxonomy, suspicion,
   or imaginable edge case is not a finding.
2. Use classifications only after proving a finding. Never use `incomplete
   closure`, `prior-review gap`, `revision-induced`, a proof gate, or a review
   mode as a reason to manufacture or prolong one.
3. Complete the bounded review below. If it establishes zero current P0/P1,
   return `PASS` immediately. Inability to establish a current P0/P1 after the
   required attack is affirmative PASS evidence, not permission to widen the
   scope or keep searching.
4. Apply no numeric review-round or rewrite limit. A re-review may return
   `FAIL` while evidence proves a current P0/P1 and must return `PASS` as soon
   as none remains. Round count, review fatigue, and desired convergence never
   change the verdict.
5. Use `Workflow stop` only when missing or contradictory binding authority
   prevents safe scoring and requires an owner choice. Never stop merely
   because a root repeated or a prior review also failed.

### Verdict truth conditions

- `FAIL` when at least one current P0/P1 is proved, including a load-bearing
  premise whose missing proof credibly permits that severity.
- `PASS` when the review is complete and zero current P0/P1 is proved. P2/P3
  may remain; continue to `spec-readiness`.

Do not withhold PASS by widening scope, reviving a resolved root, replacing a
frozen partition with another formulation, mining P2/P3, or demanding proof
for a consequence the task cannot activate.

## Basis and mode

Reread every in-scope artifact in full. Read directly referenced contracts and
only the code, tests, schema, configuration, history, or primary sources needed
to establish or disprove load-bearing claims. Use Git status/diff/log to
identify the exact artifact state; record paths, HEAD, and dirty state or the
source/version limitation. Memory and earlier reports are locators, never
current evidence.

Use one mode:

| Mode | Condition |
|---|---|
| `full` | First review or deliberate end-to-end review |
| `incremental` | Complete prior report and matching basis; unchanged outcome, scope, acceptance, and activation; changes are prior closures or their required consequences |
| `reset-to-full` | Missing/mismatched basis; changed task authority; new integration or architecture boundary; unexplained changes |

An interaction neighbor exposed by a correction stays `incremental`. Reset
only when the prior review can no longer own the basis, not because a new
finding is inconvenient.

Derive the frozen outcome lock from the latest explicit human decision and
the most specific binding catalog, decision, groundwork, task, scope, and
acceptance contract. The spec's own lock wording is drift evidence, not new
authority. If an ambiguity can hide P0/P1, prove that consequence and use
`Workflow stop`; do not choose the product decision.

## Scope and ownership

Stay inside the frozen four lanes. Do not invent adjacent product requirements.
A review closes a dependency by calling a landed substrate or escalating the
gap to its owner; owning a parallel machine inside the child is not closure.

For each P0/P1, classify necessity in `Root and closure`:

- `necessity=outcome-required` — removing the obligation makes a frozen
  observable unsafe or unreachable;
- `necessity=architecture-induced` — removing unsupported child ownership
  removes the failure; require removal or an owner decision, not completion of
  the parallel machine;
- `necessity=mixed` — separate and close only the outcome-required part.

Name a landed call as `reused=<owner>`. Entering its existing API/entity/
protocol is not lock enlargement. New create/replace/cancel ownership, a new
durable store, lifecycle, publication machine, or recovery protocol requires
the Outcome-lock K2 owner choice. Reviewer necessity is not authority.

Do not revise the spec, approve your own correction, absorb implementation or
PR review, use numeric confidence, aggregate risk scores, or finding quotas.

## Attack and root-complete batching

Calibrate depth from the worst credible task-connected consequence, reach,
reversibility, recovery cost, detectability, and activation. Domain labels do
not assign severity. Use direct evidence for load-bearing critical/high paths;
keep standard/low review on credible interfaces.

Attack the highest-consequence path first, then every remaining applicable
task-owned surface. For every suspected root:

1. State the binding obligation and current evidence.
2. Prove the reachable failure mechanism and P0/P1 consequence; distinguish
   missing proof from a proved defect.
3. Walk to the deepest task-owned causal root.
4. Sweep that root across every affected task-owned producer, constructor,
   consumer, gate, state transition, persistence/publication boundary, retry,
   rollback, recovery path, interaction neighbor, and acceptance oracle.
5. Search the current basis for all manifestations that share the root and
   closure. Group them in one finding; split only independently failing roots
   or paths requiring different closure.
6. Derive the smallest falsifiable closure outcome and independent proof.
   Prescribe a mechanism only when binding authority leaves no alternative.

Do not return one visible symptom per round. Before emitting any `FAIL`, finish
the consequence sweep for every discovered P0/P1 root and include every
credible current P0/P1 in the same batch.

When the spec provides an ordered exhaustive partition, attack its membership,
empty rows, contradictions, missing consequence rows, and task-owned extension
points. Do not replace it with a differently shaped equivalent. Treat a finite
inventory as total only when membership and every task-owned extension point
are closed.

After completing all discovered root families, run one final bounded challenge:

- for critical/high, re-attack the cleanest highest-consequence claim from one
  independent carrier or failure angle;
- for standard/low, test one focused counterexample against the controlling
  outcome, scope, acceptance, or stop condition.

Do not start a new general sweep. If this challenge proves a new P0/P1 root,
complete that entire root family before reporting. If it does not, stop the
attack and apply the verdict truth conditions.

## Re-review convergence

On every re-review:

1. Classify each prior P0/P1 `resolved`, `still present`, or `superseded` using
   current evidence. Wording change alone is not closure.
2. Verify each correction across its recorded root, consequence surface, and
   changed-rule interaction neighbors.
3. Run the single bounded final challenge defined above.
4. For every proved current P0/P1, classify it only after proof as:
   - `incomplete closure` — the prior root or recorded closure remains reachable;
   - `prior-review gap` — a different root was already provable from the prior
     basis but omitted; name that exact prior evidence;
   - `revision-induced` — the revision made the root reachable; name the clause.
5. If a root repeats, prove its current reachability and state whether the
   prior closure was incomplete or the prior diagnosis was wrong. A new line
   number, paraphrase, or alternative partition is not proof.
6. If any P0/P1 is proved, complete and return its whole root family in this
   FAIL batch. If none is proved, return PASS. Do not perform another sweep.

## Evidence and priority

Use authority in this order:

- intended behavior: latest explicit user decision and most specific binding
  task/scope/acceptance/parent contract;
- current behavior: live code, tests, schema, migrations, configuration, and
  call paths;
- external semantics: applicable version-correct primary sources;
- history, comments, names, conventions: supporting unless adopted by a
  binding contract.

Tests prove only what they assert. Green suites and mocks are not independent
correctness oracles.

Assign priority from consequence, activation, and recoverability:

- **P0** — controlling outcome is unreachable, or a task-owned path makes
  catastrophic or irreversible failure unavoidable;
- **P1** — a normal or credibly activated path can ship materially broken,
  unsafe, or unrecoverable behavior;
- **P2** — realistic bounded degradation that does not invalidate the plan
  under normal operation;
- **P3** — low-impact defect or clarity loss.

Apply mechanism-specific proof only when triggered:

- acquisition: trace release, undo, cleanup, terminal, retry, and recovery;
- database invariant: prove every load-bearing physical-schema property;
- atomicity: prove the same concrete local transaction owner/context or the
  distributed coordinator, enlistment, rollback, and recovery identity;
- structured data controlling authority/publication: distinguish materially
  different missing, null, empty, object, list, scalar, malformed, and
  conflicting states;
- totality/negative property: close the proof domain or require a bounded
  result contract.

## Report

Start with exactly:

```text
PASS
Basis: <full | incremental | reset-to-full>; <paths; Git HEAD + dirty state, or limitation>
```

or:

```text
FAIL
Basis: <full | incremental | reset-to-full>; <paths; Git HEAD + dirty state, or limitation>
```

On re-review, add concise prior decisions before current findings:

```text
Prior: <id> resolved | still present | superseded — <decisive current evidence>
```

Report findings in priority order:

```text
[Px] <short title>
[Classification: incomplete closure | prior-review gap | revision-induced]
Evidence and impact: <current location and source evidence; activation, harm, recoverability>
Root and closure: <stable id; necessity; reused owner when applicable; complete manifestation and consequence sweep; falsifiable closure>
Proof: <independent evidence or counterexamples>
```

Require all three fields for P0/P1. Include `Classification` only on re-review.
Combine P2/P3 fields when decision-relevant meaning remains clear. Do not
repeat resolved roots in the finding list.

On in-lock FAIL, end with:

```text
Next: to-spec
```

On PASS, end with:

```text
Next: spec-readiness
```

When binding authority is missing or contradictory, return `FAIL` only if the
gap credibly permits P0/P1, then end with `Workflow stop` and the exact K2
choices from `references/outcome-lock.md`. Recommend `Need your decision`
unless binding evidence selects one. Do not turn a repeated review, an
incomplete correction, or a difficult proof into an authority stop.
