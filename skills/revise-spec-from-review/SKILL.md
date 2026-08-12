---
name: revise-spec-from-review
description: "Reconcile supplied adversarial-spec-review or spec-readiness findings into a named spec folder, closing each confirmed root across its producers, consumers, state, and tests without introducing a new contradiction. Use when revising a spec from complete review findings. Triggers: revise-spec-from-review."
---

# revise-spec-from-review

You are the senior spec author revising one named spec from complete review
findings. Read the whole review and spec before changing anything.

## Success artifact

Success is the **updated spec cluster**, not a process narrative. A separate
review session (or `evals/closure`) judges that artifact. Do not declare the
spec ready or re-run the review yourself.

Consume each finding's three-field compact form (`Evidence and impact`,
`Root and closure`, `Proof`). Close the root using its **Root and closure**
(stable id, manifestations, producers, consumers, gates, states, recovery
paths, named interaction neighbors, and falsifiable decision). If `Root and
closure` is omitted or incomplete, derive the missing closure work from the
finding before editing; do not invent a wider hunt than the worklist. Do not
require separately labeled Root cluster, Consequence surface, Required
closure, Evidence, or Impact fields when the three-field form already carries
them.

## Review-cycle handoff

`adversarial-spec-review` and `spec-readiness` share one review cycle for the
same unchanged spec revision. Only a subsequent revision increments it; a
second gate on that revision carries the number forward. Obtain the cycle from
the supplied report's `Basis` line before editing.

A report ending in `Workflow stop` has reached `3/3`: do not make another
speculative revision. Return the report's plain-language decision to the human
unchanged except for any directly requested clarification. A later human change
to task authority begins a new task; it does not silently reset this stopped
cycle.

When present, treat Classification and Repeat diagnosis as part of the
worklist:

- `incomplete closure` means the stated root remains valid; close every surface
  named in its `Root and closure` before finishing it;
- `prior-review gap` means close the omitted root across its `Root and closure`
  and every same-outcome sibling the report batches. Propagate the canonical
  contract across that set; do not append clauses only for the examples the
  prior reviewer listed, and do not invent an unbound catch-up sweep beyond the
  supplied worklist;
- `revision-induced` means the current revision created the root; remove or
  reconcile the introducing change across its `Root and closure`.

For a repeated root id, obey its `Repeat diagnosis`. If it says
`incomplete revision`, retain the root and finish its missing surfaces. If it
says `prior root diagnosis incorrect`, replace the inadequate diagnosis with
the evidence-backed root before changing the spec; do not apply another patch
to the old symptom.

## Closure rules

Treat each finding as a tip of a problem tree. Walk to the nearest task-owned,
evidence-backed root. The reviewer's remedy is a clue, not authority.

Repair one root at a time across the surfaces in its `Root and closure` until
the reported failure is no longer reachable. Before finishing that root, ensure
interaction neighbors that share the changed rule are also closed in the
**spec** (or mark the root blocked). Leaving an edit-induced reachable failure
for the next review is a failed revision.

When the root is a decision over a finite state space, replace accumulating
exceptions with one ordered, exhaustive partition; every affected statement
must agree with or defer to that definition.

Independent roots may proceed when another is blocked. Do not guess past
missing evidence, an unmade product decision, or an authority boundary.
`prior-review gap` and `revision-induced` items are closed only if they appear
on the supplied worklist.

When a finding cannot close without an unmade decision, leave every
choice-dependent spec surface unchanged. Do not add alternatives,
placeholders, decision gates, future tests, or other scaffolding in place of
the decision; report the exact blocked decision and its affected surfaces.
This does not block edits for a separate finding whose root is independently
determined.

## Verification

Behavior is checked against `evals/closure` (fixture in → resulting spec out).
Discriminating checks look at the spec, not at claims that a sweep occurred.
