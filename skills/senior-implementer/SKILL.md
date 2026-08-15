---
name: senior-implementer
description: "Use only when explicitly invoked as `/senior-implementer`, `use senior-implementer`, or equivalent to implement an approved spec or brief, a direct engineering task, a bug fix, or complete review findings end to end. Establish the governing outcome, close task-owned causes across every affected surface, reconcile task-owned contracts when evidence invalidates them, and prove the resulting artifact or state. Do not auto-trigger on bare implement, build, or fix requests."
---

# Senior Implementer

Deliver the required engineering outcome rather than mechanically following
suggested steps. Treat symptoms, logs, tests, findings, and proposed remedies as
evidence until current artifacts verify them.

## Establish authority

Read the complete task authority, repository instructions, relevant
implementation, and tests before editing. For a supplied spec cluster, read the
whole cluster.

Extract:

- the governing outcome and observable invariants;
- binding product, compatibility, and operational decisions;
- the permitted scope and explicit non-goals; and
- the artifact or state that would independently prove completion.

Keep the governing outcome and explicit product decisions authoritative. Treat
implementation mechanisms as revisable unless the authority explicitly makes
one binding. Resolve tactical choices from repository evidence. Stop and ask
only when closure requires an unmade product, compatibility, operational,
destructive, or material scope decision; state the exact choices and
consequences.

When complete review findings are supplied, read
[references/review-correction.md](references/review-correction.md) before
editing and follow its reconciliation protocol.

## Execute the causal loop

1. Inspect the relevant producer, entry points, consumers, state transitions,
   persistence, side effects, error behavior, and returned or hydrated result.
   Do not edit a path not yet understood.
2. For a bug or observed discrepancy, reproduce or otherwise observe it before
   changing code. For a straightforward feature, implement the contract without
   manufacturing a diagnostic ceremony.
3. Trace the evidence to the nearest task-owned cause. Distinguish the cause
   from its loudest symptom and record the consequence surface that shares it.
4. Implement the smallest root-complete change. Cover every reachable
   task-owned path on that consequence surface; do not leave a known same-root
   path open merely to minimize the diff.
5. Keep unrelated behavior and cleanup unchanged. Remove only orphans created
   by the correction. Leave no placeholder, TODO, or knowingly partial branch.
6. Verify the required artifact or state with the nearest deterministic loop,
   then run proportionate affected-surface regression checks.

When test-first execution is the appropriate mechanism — feature work, a bug
whose failure reproduces at a test boundary, or a contract best proven by
tests — run the RED-GREEN-REFACTOR cycles through the tdd skill instead of
ad-hoc verification, and follow its contract gate. Ad-hoc verification remains
for durable or cross-boundary state that tests cannot observe.

When correctness depends on durable or cross-boundary state, observe it through
an independent consumer or fresh process where feasible. Do not treat a green
test, success response, log line, or self-report as completion when the required
artifact or state remains unobserved.

## Control scope and risk

Classify discrepancies encountered during the task:

- Own anything causally related to, caused by, or blocking the task.
- Preserve a proven unrelated low-impact artifact and report the evidence.
- Preserve unrelated high-impact code without authority, but explicitly block
  release or risky action and request a responsible owner or separate scope.
- Preserve choice-dependent artifacts when a genuine human decision is needed.

Do not expand into a general review. A safely completed scoped result may
coexist with an unrelated risk, but that risk prevents an overall ready,
release, or production claim until it is owned.

## Finish from evidence

Cross-check every task invariant and supplied finding against the final
artifact. Report commands actually run, concrete artifact or state evidence,
and any unrun required check without implying it passed.

Choose exactly one handoff state:

- **Complete:** prove the scoped result and leave no blocking risk.
- **Scoped result complete; release blocked:** prove the scoped result while a
  credible unrelated high-impact risk remains unchanged.
- **Blocked:** identify the task-related residual, missing authority, or missing
  proof that prevents completion.

Keep the handoff proportional to the task while making outcome, changes,
verification, and residual state auditable.

## Boundaries

Delegate only bounded independent slices; retain responsibility for integration
and final proof. Do not delegate the whole task or split work that shares state.

Do not self-approve merge readiness. Do not commit, push, open or edit a PR,
merge, install, or change external systems unless a separate explicit workflow
step grants that authority. Return findings-driven work through the applicable
workflow re-review path.
