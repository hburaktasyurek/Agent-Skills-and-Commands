---
name: adversarial-spec-review
description: Red-team review that tries to kill a plan or spec. Returns a priority-sorted finding list (P0–P3) with an explicit PASS/FAIL verdict. Use for plans/specs; use risk-calibrated-pr-review for an opened implementation PR, or adversarial-diff-review for an explicitly requested branch/worktree diff.
---

Review the current plan or spec as the engineer accountable for the
consequences of approving it. Treat every claim as unverified, regardless of
how polished, confident, conventional, or well tested it appears. The author
and the tools used to write it are irrelevant.

Do not modify files. This skill produces analysis only.

## Review question

Ask:

> Can this plan achieve its stated outcome without creating an unacceptable
> failure on any consequence-bearing path it owns or necessarily depends on?

This is not an implementation-readiness check. `spec-readiness` separately
asks whether an implementer would have to invent a structural contract. Report
an omitted contract here only when the omission can invalidate the intended
outcome, safety, correctness, or recovery of the plan.

## Non-negotiable posture

- Do not trust assertions merely because code, tests, diagrams, names, or
  prose repeat them. A test may encode the same false premise as the plan.
- Derive review depth from the worst credible consequence, not document size,
  diff size, finding count, author identity, or an explicit "critical" label.
- Judge failures by what they can cause. A one-character UI change is
  low-impact only when it cannot activate a payment, authority, data, privacy,
  availability, or other higher-consequence path.
- Do not average unlike risks into a middle setting. One load-bearing
  consequence surface may control the whole review.
- Stay within the stated outcome, scope, and contracts it necessarily depends
  on. Do not invent adjacent product requirements to keep the review alive.
- Distinguish lack of proof from proof of a defect. Never fabricate certainty
  to obtain a finding or a pass.

## 1. Establish the exact review basis

Before forming findings:

1. Resolve and reread every current artifact in scope from beginning to end.
   Read directly referenced task, roadmap, contract, code, test, schema,
   configuration, migration, history, or external material only where it can
   establish or invalidate a material premise.
2. When the in-scope artifacts belong to a Git repository, inspect status,
   staged and unstaged spec diffs, the relevant log, and any commit diff needed
   to identify the current artifact state. Record the reviewed paths, `HEAD`,
   and whether those paths are dirty. Do not inspect an unrelated checkout for
   an inline or externally supplied artifact. When no applicable Git state is
   available, record the equivalent source/version limitation.
3. Derive the controlling task contract:
   - intended outcome and authority source;
   - in-scope behavior and explicit non-goals;
   - acceptance or stop conditions;
   - current, gated, dormant, and future activation states;
   - upstream dependencies and downstream consumers;
   - material assumptions and unresolved evidence.
4. On a re-review, require the complete prior report and its review basis.
   Reread the current artifacts; memory, a summary, and the old findings are
   location aids, never current evidence.

If task identity, scope, activation, or acceptance is contradictory or
unresolved in a way that can hide a P0/P1 failure, report that as the failure.
Do not silently choose the missing product decision.

## 2. Calibrate by consequence

Infer one posture from evidence. It controls attack depth, not finding
priority:

- **critical** — a credible path can move or duplicate money; corrupt, expose,
  or irreversibly lose material data; break authentication, authorization,
  identity, privacy, or security boundaries; strand an irreversible
  migration/protocol cutover; or cause a broad unrecoverable outage;
- **high** — a credible path can create materially wrong cross-component
  state, contract failure, or substantial operational/recovery cost, but the
  harm is bounded and recoverable;
- **standard** — failure is contained to a component or workflow and recovery
  is routine;
- **low** — failure is local or presentational and evidence rules out
  activation of a higher-consequence path.

Use the highest posture supported by a credible, task-connected failure path.
Do not inflate posture with hypothetical systems the task cannot reach.
Record the decisive consequence and activation evidence in the report.

For `critical` and `high`, require direct evidence for every load-bearing
contract and applicable failure transition. For `standard` and `low`, keep the
review bounded to credible consequence paths and interfaces; do not perform a
ceremonial sweep of irrelevant dimensions.

## 3. Build a private coverage ledger

Map the plan before attacking it. Include only applicable surfaces, but do not
omit a surface merely because the spec does:

- promises, invariants, assumptions, and acceptance claims;
- producers, consumers, ownership, identity, and authority boundaries;
- state transitions, partial states, denial and error paths;
- retry, replay, idempotency, concurrency, ordering, timeout, cancellation,
  rollback, and recovery behavior;
- persistence, migration, compatibility, and lifecycle boundaries;
- authentication, authorization, privacy, and security effects;
- external-service, library, platform, and version-dependent semantics;
- operational detection and recovery where silent failure changes impact;
- test and acceptance oracles, including what each proposed check would and
  would not prove.

For each applicable item, record the claimed obligation, evidence required to
establish it, activation state, worst credible consequence, and every
dependent surface that would also fail. The ledger is private working state;
the final coverage receipt is compact.

Use claim-matching authority:

- Intended behavior comes from the latest explicit user decision and the most
  specific binding task, scope, acceptance, and parent contract.
- Current system behavior comes from live code, tests, schema, migrations,
  configuration, and actual call paths. Current code proves the starting
  state; it does not overrule an intentional task change.
- External semantics require applicable, version-correct primary sources.
- Tests prove only the observations and counterexamples they actually assert.
  A green suite, a happy path, or a mock repeating the implementation is not
  an independent correctness oracle.
- History, comments, names, conventions, and analogous code are supporting
  evidence unless a binding contract adopts them.

## 4. Attack consequence paths and close root families

Attack the highest-consequence path first, then every remaining applicable
ledger surface.

For each suspected failure:

1. State the obligation that must hold.
2. Prove the mechanism that violates or leaves it unproved.
3. Trace the consequence through every task-owned producer, consumer, state,
   side effect, and recovery boundary it can invalidate.
4. Walk upstream through verified causal links to the deepest task-owned root.
5. Search all task-owned manifestations of that root before writing the
   finding.
6. Derive the smallest falsifiable closure condition. Describe the required
   outcome; prescribe an exact mechanism only when the binding evidence makes
   that mechanism necessary.

Group manifestations that share one root and closure condition. Split paths
that can fail independently or require different proof. Do not return one
symptom per review round when the current evidence exposes the family now.

Challenge especially confident clauses, apparently clean boundaries, and
tests that mirror the plan. Verify unhappy paths and invalid assumptions; do
not let happy-path success stand in for correctness.

## 5. Complete the first review

A first review is `full`. Finding one P0/P1 is not a stopping condition.
Before reporting:

1. Cover every applicable ledger surface at the calibrated depth.
2. Complete every discovered P0/P1 root family and its consequence sweep.
3. For `critical` and `high`, re-attack the cleanest and
   highest-consequence claims from a different angle. For `standard` and
   `low`, run one focused counterexample check against the controlling scope
   and acceptance claims; do not broaden into a ceremonial second sweep.
4. Stop only when that final challenge finds no new P0/P1 root family.

The goal is one complete actionable P0/P1 batch for the current artifacts, not
an artificially small list. Do not pad the batch with speculative P2/P3 items.

## 6. Re-review without restarting blindly

Use `incremental` mode only when the complete prior report is available, its
review basis matches the prior artifacts, the task contract and activation
boundary are unchanged, and every current spec change is explainable as a
prior-finding correction or its required consequence.

In incremental mode:

1. Classify every prior finding as `resolved`, `still present`, or
   `superseded`, using current evidence.
2. Verify each correction across its full recorded root and consequence
   surface.
3. Attack changed, interacting, and previously unproved surfaces.
4. Run one fresh challenge pass over the highest-consequence current claims.
5. Stop when no prior P0/P1 remains and the fresh pass finds no new P0/P1.

Reset to `full` and report `reset-to-full` when the prior report or basis is
missing, task identity/scope/acceptance/activation changed, a new architecture
or integration boundary appeared, unexplained spec changes exist, or a fix
creates a new root family outside the prior coverage.

Never carry a finding forward because it existed previously. Never call a
finding resolved because the wording changed.

## Priority

Priority reflects consequence, activation, and recoverability:

- **[P0]** The plan cannot achieve its controlling outcome, or a task-owned
  path makes catastrophic or irreversible failure unavoidable.
- **[P1]** A normal or credibly activated path can ship materially broken,
  unsafe, or unrecoverable behavior.
- **[P2]** A realistic path degrades correctness, safety, or recovery but does
  not invalidate the plan under normal operation.
- **[P3]** Low-impact defect or clarity loss with bounded consequence.

An evidence gap is not automatically a defect. When the plan relies on an
unproved premise, state the missing proof and assign priority from the
credible consequence of relying on it. Do not balance findings across levels
or lower severity to make the report look proportional.

## Verdict and output

Open with exactly one verdict:

- `FAIL` when any current P0/P1 exists, including a load-bearing premise whose
  missing proof can credibly hide that severity;
- `PASS` when the calibrated review completed and no P0/P1 remains. P2/P3 may
  remain; the next gate is `spec-readiness`.

Then report:

```text
Review mode: full | incremental | reset-to-full
Artifact basis: <reviewed paths; Git HEAD and dirty state, or limitation>
Consequence posture: critical | high | standard | low — <decisive evidence>
Task contract: <outcome, scope, activation, material dependencies/non-goals>
```

On re-review, add a compact prior-finding reconciliation before current
findings.

Report current findings in priority order:

```text
[Px] <short title>
Evidence: <current spec location plus claim-matching source evidence>
Obligation: <what must hold>
Mechanism: <how the current plan fails or leaves it materially unproved>
Consequence: <activated downstream harm and recoverability>
Root cluster: <root and other manifestations covered>
Required closure: <falsifiable outcome, not an unnecessary implementation>
Verification: <evidence that would prove closure>
```

For P0/P1, every field is required. For P2/P3, combine fields when doing so
loses no decision-relevant information.

Close with:

```text
Coverage receipt: <applicable consequence surfaces checked; material evidence
gaps; final-challenge result; why review stopped>
Next: revise-spec-from-review | spec-readiness
```

Keep low- and standard-consequence reports compact. If nothing rises above
P2, do not pad with P3 findings.

## Boundaries

- Read-only review: no spec, code, Git, PR, or workflow mutation.
- Review the artifact, not the author's competence or intent.
- Do not use numeric confidence, aggregate risk scores, or finding quotas.
- Do not treat polished prose, familiar architecture, existing code, or green
  tests as proof.
- Do not widen product scope, redesign unrelated systems, or demand
  future-proofing without a task-connected consequence.
- Do not absorb `spec-readiness`, implementation, or PR review.
- Do not approve your own corrections; re-review current artifacts in a
  separate review context.
