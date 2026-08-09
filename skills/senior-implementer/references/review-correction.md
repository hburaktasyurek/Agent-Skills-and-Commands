# Review Correction Protocol

Use this protocol only when the task supplies complete review findings. Treat
the findings as a reconciliation worklist, not as truth, authority, or an exact
implementation recipe. Do not start another general review.

## Verify and classify

Verify every finding against the current artifact or observed behavior before
editing. Assign exactly one disposition:

- `accepted-and-corrected`: current evidence proves the finding and closure
  needs no new human decision;
- `refuted-with-evidence`: current evidence disproves the finding; preserve the
  correct artifacts; or
- `human-decision-required`: closure depends on an unmade binding decision;
  preserve every choice-dependent artifact and ask for the minimum decision
  with concrete consequences.

Keep manifestations of the same invariant under one root lineage. Classify an
open manifestation as `same-root-residual` when the invariant remains
reachable, and as `mechanism-level-repeat` when new evidence defeats the same
proof or enforcement model after a correction. Trigger escalation from causal
evidence, never from review-round count. Record the selected recurrence in the
handoff for every finding that carries prior root lineage.

## Reconcile the correction surface

Compare the governing outcome, binding decisions, named spec, implementation,
tests, and observed behavior. Use the review's `Correction surface` as a
hypothesis and correct it when current evidence requires another surface:

- `implementation-only`: keep the sufficient spec intact and change the
  implementation and its evidence.
- `spec-and-implementation`: update every affected task-owned spec artifact and
  implementation together when evidence invalidates a spec assumption,
  mechanism, scope statement, valid-state set, construction boundary, or proof
  contract. Do not make a gratuitous code edit when current code already
  satisfies the corrected contract and evidence proves it.
- `evidence-only`: gather the named evidence without manufacturing a defect or
  changing correct artifacts.
- `task-decision-required`: stop at the unresolved product, compatibility,
  operational, destructive, or material scope choice.

Treat a named spec as a maintained contract artifact, not an immutable oracle.
Within an unchanged governing outcome and scope, revise a disproven task-owned
mechanism without asking avoidable permission. Never leave the spec knowingly
stale after changing a mechanism or observable contract; never rewrite a valid
spec merely because an implementation finding exists.

When a mechanism cannot establish its required domain, stop adding syntax
cases, inventory rows, or local exceptions. Replace it with the smallest
task-owned boundary whose outcome can be independently falsified. Enforce a
narrowed valid-state set at every named construction or ingestion boundary,
not only at the reported serializer or call site.

## Prove and hand off

Prove closure across the complete root consequence surface with an oracle that
does not merely repeat the failed enforcement representation. Any known
task-related or same-root residual blocks completion.

For a load-bearing `all`, `none`, `never`, `anywhere`, or `exhaustive` claim,
attack the claimed domain with a counterexample derived independently of the
implementation's classifier or pattern list. Vary material position or
embedding, carrier or path, aliasing or nesting, and a neighboring safe value
where applicable. Do not let the implementation's recognized examples define
its own acceptance oracle.

Include these fields even when their value is `none`:

```text
Contract reconciliation
Finding disposition
Recurrence: first-seen | same-root-residual | mechanism-level-repeat
Governing outcome
Invalidated spec clauses
Spec changes
Implementation changes
Independent verification
Human decision required
PR metadata impact: unchanged | stale-before-merge
```

Set `PR metadata impact` to `stale-before-merge` when the current PR description
still claims a superseded mechanism, outcome, scope, non-goal, material
artifact, or validation result. Report the impact without editing the PR.
