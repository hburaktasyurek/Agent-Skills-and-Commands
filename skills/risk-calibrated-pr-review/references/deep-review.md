# Deep Review Method

Use this reference when a surface is medium, high, critical, unknown,
cross-boundary, or governed by a load-bearing universal claim.

## Impact and activation

Record for each surface:

- user or business outcome;
- changed state, control boundary, or external behavior;
- activation as `live`, `conditional`, `dormant/support-only`, or `unknown`,
  with the concrete caller, configuration, rollout, or prerequisite;
- worst credible failure and its activation path;
- affected reach;
- reversibility and recovery cost;
- detectability and containment; and
- material unknowns.

Do not infer immediate production harm from dormant code. Dormancy does not
erase latent harm at an approved future activation boundary. When unknown
activation could materially raise risk or depth, record the lowest defensible
tier and name the upward uncertainty. Return `INCOMPLETE` only when that unknown
meets the main skill's convergence rule 3 and no proven failure already
requires `FAIL`.

## Risk and attack depth

- **Low:** cosmetic or tightly local failure, limited reach, quick reversal,
  and no durable-state or trust-boundary crossing. Verify task-to-diff
  completeness, hunk justification, direct consumers, containment, and the
  smallest relevant check.
- **Medium:** real functional degradation or contained integration/state error
  with routine recovery. Also attack realistic empty, invalid, error,
  state-transition, retry, and compatibility paths.
- **High:** material harm involving money, access, privacy, data integrity,
  availability, compliance, silent reach, or difficult recovery. Also verify
  end-to-end invariants across authorization, isolation, transactions,
  idempotency, concurrency, partial completion, rollback, migration,
  configuration, deployment, and external contracts where applicable.
- **Critical:** a concrete path can cause severe, broad, or difficult-to-reverse
  harm. Independently substantiate every material safety claim and verify
  recovery, containment, detection, rollout, rollback, and critical dependency
  behavior. Specifically named unavailable material proof prevents `PASS` only
  when it meets convergence rule 3.

Set overall risk to the highest credible surface. Do not average harmless
surfaces against one severe path. Diff size controls inspection effort, not
business consequence. Select low only when containment is evidenced.

## Proof domains and oracle independence

Classify a load-bearing universal property:

- **Closed:** authoritative contract makes every member finite and enumerable.
- **Self-bounded:** a task-owned construction boundary makes the valid domain
  finite or structurally constrained.
- **Open-world:** new syntax, carrier, alias, nesting, producer, consumer, or
  integration paths can extend the domain.

A finite current inventory proves only the inventoried set unless a valid
boundary closes the domain. Tests generated from the enforcement model's own
patterns share its blind spots.

Attack an open-world or exhaustive claim with a counterexample derived
independently of the classifier. Where applicable vary:

- position and embedding;
- carrier and source-to-consumer path;
- aliasing and intermediate state;
- nesting and serialization;
- callable or invocation shape;
- safe neighboring values; and
- a result-level consumer distinct from the enforcement representation.

Do not require every imaginable counterexample after one concrete defect is
proven. Use that defect for `FAIL`, then report remaining invariant coverage
honestly.

## Evidence and stopping

Prefer safe focused execution when it can decide a material question. State the
expected invariant and its authority before accepting a check as proof. Green
CI supports only what its checks actually exercise.

Discovery is complete when every changed hunk is mapped to an impact surface,
every changed entry point and boundary has an activation state, every material
trace reaches a consumer, containment boundary, or named unknown, and every
tier-appropriate attack is examined, inapplicable with reason, or blocked on
named evidence. It does not require reading unrelated repository code.

Treat a named unknown as the end of that discovery path, not an invitation to
expand the task. It blocks the verdict only when it meets the SKILL convergence
law: plausible answers could change the P0/P1 result or required attack depth,
or a binding load-bearing open-world claim lacks a proof-domain boundary or
mechanism capable of establishing it. Name the exact obligation, credible
P0/P1 consequence, and bounded evidence or proof contract needed; do not turn
unrelated possible consumers into blockers. Otherwise report the unknown as
residual risk and finish the bounded review.

Do not duplicate a finding's future closure proof as a separate evidence-only
gap. Put that proof in the finding's `Proof obligations`. Reserve required
evidence for an unresolved result, a distinct material surface, or a controlling
task decision.
