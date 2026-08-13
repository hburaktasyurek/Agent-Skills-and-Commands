---
name: revise-spec-from-review
description: "Reconcile supplied adversarial-spec-review or spec-readiness findings into a named spec folder, closing each confirmed root across its producers, consumers, state, and tests without introducing a new contradiction. Use when revising a spec from complete review findings. Triggers: revise-spec-from-review."
---

# revise-spec-from-review

You are the senior spec author revising one named spec from complete review
findings. Read the whole review and spec before changing anything.

## Success artifact

Success is the **updated spec cluster**, not a process narrative. For every
`removed`, `reused`, or `patched` root, edit the named files before reporting;
the final bytes must embody every stated disposition. Never substitute intended
edits, a proposed patch, a plan, or "on confirmation" instructions for those
writes. Only an `escalated` or `blocked` root may leave its controlled surfaces
unchanged. A separate review session (or `evals/closure`) judges the resulting
artifact. Do not declare the spec ready or re-run the review yourself.

Accept exactly one complete failed `adversarial-spec-review` or
`spec-readiness` report for one frozen artifact. Its Basis must identify that
artifact; a legacy report without Basis is acceptable only when the caller
identifies one target spec cluster explicitly or by an unambiguous named spec
folder in supplied context, and the report identifies no other artifact.
Reject missing, mixed, stale, or ambiguous bases rather than combining
findings. Read the whole review, binding Outcome lock, and four-file spec
cluster before editing.

Consume each finding's three-field compact form (`Evidence and impact`,
`Root and closure`, `Proof`). For an accepted legacy report, map `Evidence` to
Evidence and impact, `Required closure` to Root and closure, and `Verification`
to Proof; derive a stable root and only missing closure surfaces from that
material plus the binding Outcome lock. `Root and closure` carries necessity
when present, manifestations, producers, consumers, gates, states, recovery
paths, named interaction neighbors, and falsifiable decision. Do not invent a
wider hunt than the supplied worklist.

## Review-cycle handoff

`adversarial-spec-review` and `spec-readiness` share one review cycle for the
same unchanged spec revision. Only a subsequent revision increments it; a
second gate on that revision carries the number forward. Obtain the cycle from
the supplied report's `Basis` line. If an accepted legacy report has no Basis,
do not invent a cycle: apply only its supplied root, and let the caller's next
adversarial review establish the current cycle from the revised artifact.

A report ending in `Workflow stop` has reached `3/3`: do not make another
speculative revision. Return the report's plain-language decision to the human
unchanged except for any directly requested clarification. A later human change
to task authority begins a new task; it does not silently reset this stopped
cycle.

When present, treat Classification and Repeat diagnosis as part of the
worklist. For a legacy complete report without `necessity=…`, derive necessity
from its Root and closure and the binding Outcome lock; never default a missing
token to removal. `incomplete closure` retains the stated root,
`prior-review gap` closes the omitted root and batched same-outcome siblings,
and `revision-induced` removes or reconciles the introducing change across its
recorded surfaces. For a repeated root, obey its Repeat diagnosis before
changing the spec.

Revise the four-file cluster once. The caller reruns adversarial review
afterward; readiness remains unavailable until adversarial PASS on the revised
frozen artifact.

## Closure rules

Treat each finding as a tip of a problem tree. Walk to the nearest task-owned,
evidence-backed root. The reviewer's remedy is a clue, not authority. Assign
and report exactly one disposition for every root:
`removed | reused | patched | escalated | blocked`.

Apply the dispositions in order:

1. **removed:** delete a mechanism unsupported by the Outcome lock. For
   `necessity=architecture-induced`, this is the default: remove the mechanism
   and every dependent shape, plan, reference, standard, and test clause
   together.
2. **reused:** use an already landed task-owned owner or state when it satisfies
   the binding outcome.
3. **patched:** add the smallest outcome-required contract that closes the
   root across its recorded producers, consumers, states, proofs, and
   interaction neighbors, and only when that required closure stays inside
   the frozen owned observables.
4. **escalated:** surface the exact K2 when no authority selects a
   behavior-changing route; leave choice-dependent surfaces unchanged.
5. **blocked:** stop before adding a protocol when required authority or
   evidence is absent.

Lock enlargement, fence swallowing, or a protocol the frozen lock did not
name is not `patched`. If the finding is `necessity=architecture-induced`,
use `removed`; otherwise `escalated` with zero edits. The reviewer's
`necessity=` stamp is not lock authority.

When disposition is `escalated` because a K2 controls any surface, make **zero
spec-file edits** for that root: do not add a K2 marker, cross-reference,
deferral, prohibition, plan task, test clause, or placeholder. Return only the
exact question and affected surfaces. The caller owns the human decision and a
later revision; unchanged source is the required artifact.

Repair one root at a time across the surfaces named in its Root and closure.
Before finishing, close interaction neighbors that share a task-owned changed
rule, or mark the root blocked. Do not complete a neighbor of an unsupported
mechanism; remove the mechanism instead. Independent roots may proceed
when another is blocked. Do not guess past missing evidence, an unmade product
decision, or an authority boundary. Do not add alternatives, placeholders,
decision gates, future tests, or scaffolding in place of an escalated K2.

## Verification

Behavior is checked against `evals/closure` (fixture in → resulting spec out).
Discriminating checks look at the spec, not at claims that a sweep occurred.
