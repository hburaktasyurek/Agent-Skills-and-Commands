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

For each supplied finding, close its **Root cluster** using its **Consequence
surface** (producers, consumers, gates, states, recovery paths, and named
interaction neighbors). If the report omits those fields, derive them from the
finding before editing; do not invent a wider hunt than the worklist.

## Closure rules

Treat each finding as a tip of a problem tree. Walk to the nearest task-owned,
evidence-backed root. The reviewer's remedy is a clue, not authority.

Repair one root at a time across its Consequence surface until the reported
failure is no longer reachable. Before finishing that root, ensure interaction
neighbors that share the changed rule are also closed in the **spec** (or mark
the root blocked). Leaving an edit-induced reachable failure for the next
review is a failed revision.

When the root is a decision over a finite state space, replace accumulating
exceptions with one ordered, exhaustive partition; every affected statement
must agree with or defer to that definition.

Independent roots may proceed when another is blocked. Do not guess past
missing evidence, an unmade product decision, or an authority boundary.
`new-out-of-batch` items are closed only if they appear on the supplied
worklist.

When a finding cannot close without an unmade decision, leave every
choice-dependent spec surface unchanged. Do not add alternatives,
placeholders, decision gates, future tests, or other scaffolding in place of
the decision; report the exact blocked decision and its affected surfaces.
This does not block edits for a separate finding whose root is independently
determined.

## Verification

Behavior is checked against `evals/closure` (fixture in → resulting spec out).
Discriminating checks look at the spec, not at claims that a sweep occurred.
