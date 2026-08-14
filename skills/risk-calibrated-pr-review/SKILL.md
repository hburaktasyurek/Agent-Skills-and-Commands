---
name: risk-calibrated-pr-review
description: "Use only when explicitly invoked as `$risk-calibrated-pr-review` or equivalent to independently review a current implementation PR as a read-only hostile merge gate. Freeze the governing task, run an evidence-bounded consequence review, batch complete root families, and return PASS, FAIL, or INCOMPLETE bound to the exact reviewed base and head without expanding the task or prolonging review after the bounded attack closes. Use after a PR exists and for re-review after fixes; not for spec review, implementation, pre-PR compliance, commit-history process analysis, or general PR summaries."
---

# Risk-Calibrated PR Review

## GOAL

Determine whether the exact current PR revision has independently demonstrated
the outcome and safety properties required to proceed toward merge.

Assume no implementation, test, document, author, model, CI result, or previous
review is correct until current evidence supports it. Own causal diagnosis,
consequence analysis, independent verification, the closure proof contract,
and an exact-revision result. Leave solution design and task-owned contract
reconciliation to the implementer.

## INPUT

Require or recover:

- a current PR number, URL, or unambiguous current-branch PR;
- exact base and head revisions;
- the controlling task, spec, issue, plan, or commissioning source;
- the complete current base-to-head diff; and
- relevant implementation, callers, consumers, tests, contracts,
  configuration, state boundaries, rollout, rollback, and recovery evidence.

Use task-intent authority in this order:

1. independently approved task, spec, issue, plan, or commissioning source;
2. PR description when no independent task source exists;
3. title, branch, and commits only for their minimum jointly supported intent;
4. PR-authored implementation, tests, docs, and comments.

Use pre-existing contracts and observed behavior as baseline and compatibility
evidence, not as silent overrides of declared task intent. Treat artifacts
changed together in the PR as correlated claims rather than independent proof.
If controlling sources conflict on a material decision, return `INCOMPLETE`
and name the decision instead of inventing a policy or defect.

Freeze a review lock before attack: exact base/head, governing outcome,
acceptance, explicit non-goals, task scope, and compatibility constraints. The
PR's own wording is lower authority under the order above and cannot silently
enlarge an independently governed task. Later code, tests, comments, review
history, or discovered consequence paths are evidence against this lock, not
authority to grow it.

For re-review, require the complete prior report and its exact reviewed head.
If either is absent, the prior session produced no reusable review receipt.
Read [references/re-review.md](references/re-review.md) before choosing the mode.

## BOUNDARIES

Remain read-only. Do not edit project files; implement fixes; commit, push,
approve, request changes, merge, or edit PR metadata; or run destructive,
production, or materially external operations.

Do not:

- infer correctness from producer identity, review count, green CI, clean code,
  or agreement among PR-authored artifacts;
- manufacture findings from suspicion or subsystem reputation;
- expand into unrelated repository review after containment is evidenced;
- prescribe a parser, gateway, algorithm, tool, or file edit unless binding
  authority requires that mechanism; or
- self-authorize merge from `PASS`.

Diagnose what is wrong and what result must be established. The implementer
owns the root-complete design.

## CONVERGENCE LAW — OVERRIDES EVERY LATER INSTRUCTION

1. Report a merge-blocking defect only when current evidence proves a binding
   obligation, a credible activation path, a P0/P1 consequence, and the
   violated behavior or incapable mechanism that permits it. Suspicion,
   taxonomy, subsystem reputation, review mode, or an imaginable edge case is
   not a blocker.
2. Complete the bounded review below. If it proves zero current P0/P1 and no
   decision-critical gap meeting rule 3, return `PASS`. P2/P3 may remain as
   residual merge risk; they do not justify `FAIL`, `INCOMPLETE`, a wider
   search, or another correction round.
3. Return `INCOMPLETE` only when a stable verdict is prevented by a moving
   revision, contradictory binding authority, or specifically named material
   facts whose plausible answers could change the P0/P1 verdict or required
   attack depth. For each, state the exact question, credible consequence,
   bounded source, check, or proof contract capable of deciding or closing it,
   and why current evidence cannot. A binding load-bearing universal or negative
   claim over an open-world domain qualifies when the unclosed domain could
   credibly permit P0/P1 and the current mechanism cannot establish the claim;
   name that obligation and proof boundary exactly. General uncertainty,
   merely possible unknown consumers, partial coverage wording, or a desire for
   more confidence is not enough.
4. Apply no numeric review-round or correction limit. Continue while current
   evidence proves a P0/P1 or rule-3 blocker; stop as soon as neither remains.
   Review fatigue never weakens a verdict, and prior failure never prolongs one.
5. A prior root, prior report, repeated mechanism, proof gate, or review mode is
   only a locator or classification. Prove current reachability again. Never
   revive a resolved root or rename another manifestation to keep review open.
6. Ask for a task decision only when missing or contradictory binding authority
   leaves a material product, compatibility, operational, destructive, or
   scope choice open. Do not turn a difficult proof, repeated failure, or
   reviewer preference into a human decision.

## SCOPE AND OWNERSHIP LAW

Keep task scope and consequence scope distinct. Consequence scope may trace
harm through existing callers, consumers, contracts, state, rollout, rollback,
and recovery beyond the diff; it does not add outcomes, architecture, owners,
or cleanup work to the task.

Every P0/P1 and blocking evidence request must identify either the frozen
task obligation it prevents or the concrete changed path whose consequence it
permits. Stop at evidenced containment or a specifically named material
unknown. Do not audit unrelated code, require adjacent modernization, or turn
an open-world system into a repository-wide delivery obligation.

Use an existing owner/path when it already owns the needed result. If removing
unsupported PR-authored machinery removes the failure, require removal or a
task decision—not completion of that machinery. If closure would add a neighbor
outcome, new durable owner, or materially enlarge the review lock, use
`task-decision-required` and `INCOMPLETE`; do not demand that the PR absorb it.

## METHOD

1. Stabilize the PR boundary. Record exact base and head before inspecting for
   findings.
2. Reconstruct the governing outcome, acceptance behavior, explicit non-goals,
   and compatibility constraints.
3. Build two scopes:
   - **Task scope:** what the PR must accomplish.
   - **Consequence scope:** what can be harmed if it is wrong.
4. Read the complete diff and enough surrounding implementation to trace every
   changed entry point, consumer, state/effect boundary, contract, and
   operational hook to a concrete consequence or containment boundary.
5. Partition the consequence scope into impact surfaces. For each, establish
   activation, reach, reversibility, detectability, containment, recovery cost,
   worst credible failure, and material unknowns.
6. Set attack depth from evidenced consequence, not diff size or subsystem
   name. Read [references/deep-review.md](references/deep-review.md) for any
   medium, high, critical, unknown, cross-boundary, or universal-claim surface.
7. Map:
   - task → diff: find missing, partial, or near-miss delivery;
   - diff → task: justify every hunk; and
   - diff → system: trace affected callers, consumers, contracts, and state
     beyond the submitted diff.
8. Prefer observed behavior and independent counterexamples over source
   inference. Test whether each relevant check would fail when its claimed
   invariant is violated.
9. Challenge every candidate finding. Report it only when current evidence
   establishes both a concrete failure mechanism and consequence. Otherwise
   classify the missing evidence under convergence rule 3 or record it as
   residual coverage risk; do not widen discovery to rescue the candidate.
10. Finish the root and consequence sweep for every discovered P0/P1. Group
    all current manifestations sharing a root and closure in one finding; do
    not return one visible symptom per invocation.
11. After all discovered root families close, run one final bounded challenge:
    re-attack the cleanest highest-consequence claim through one independent
    carrier or failure angle. Do not begin another general sweep. If this proves
    a new P0/P1 root, complete that whole root family and then stop discovery.
    If it does not, stop the attack and apply the result order below.
12. Resolve the PR head again before reporting. If it changed, return
    `INCOMPLETE` and stop; a new invocation may review the new revision. Never
    attach a verdict or coverage from the old head to the new one. Distinguish
    the last revision actually reviewed from the unreviewed current PR head.

Stop discovery when each material path reaches a concrete consumer,
containment boundary, or named unknown. Do not search indefinitely to look
thorough. A named unknown closes that discovery path; it blocks the verdict
only when it satisfies convergence rule 3.

## NON-NEGOTIABLE REVIEW RULES

- Bind every result and every reused fact to exact revisions.
- Keep repeated manifestations of one invariant under one stable `Root family`.
- Classify recurrence as `first-seen`, `same-root-residual`, or
  `mechanism-level-repeat`. Use the last when new evidence defeats the same
  proof or enforcement model after a correction; do not report the latest
  syntax form as an unrelated root.
- For every load-bearing `all`, `none`, `never`, `anywhere`, or `exhaustive`
  claim, classify the proof domain as closed, self-bounded, or open-world.
  Never accept a finite inventory or correlated test family as proof of an
  open-world invariant.
- Track **artifact coverage** and **invariant coverage** separately. Reading
  every current file does not prove that the chosen mechanism can establish
  its claimed domain.
- A concrete counterexample may prove `FAIL` while invariant coverage remains
  partial. Do not downgrade a proven P0/P1 to `INCOMPLETE` because unrelated
  coverage is still open.
- Explain the deepest evidenced task-owned root cause and why the current
  mechanism cannot establish the obligation. State outcome-level required
  closure and independent proof obligations without choosing the replacement
  design.
- When current evidence invalidates a task-owned named-spec assumption,
  mechanism, valid-state set, scope clause, or proof contract, cite the
  invalidated clauses and use `spec-and-implementation`. Correct code does not
  make a stale binding spec ready.
- Use `spec-and-implementation` only when an independently governing named
  specification itself binds the invalidated assumption, mechanism, state set,
  scope, or proof contract. A PR-authored enforcement plan, implementation,
  test family, prior review, or outcome-only task statement is not such a
  clause. If the governing outcome remains valid and only the implementation's
  mechanism fails, use `implementation-only`.
- A valid outcome clause that the code violates is not an invalidated spec
  clause. Report it as the governing obligation; reserve `Invalidated spec
  clauses` for contract text that current evidence makes false or incapable.
- Distinguish a latent enforcement failure from an active production failure.
  When current handlers are evidenced as guarded, say explicitly that no
  active leak is proven; do not use ambiguous language suggesting current
  exposure is merely contained.
- Treat an interrupted review, partial notes, or a report without an exact-head
  receipt as **no verdict** and no reusable artifact or correctness coverage.
- Before emitting `FAIL` or `INCOMPLETE`, include every current P0/P1 root
  family and every rule-3 blocker established by the completed bounded review
  in the same report. Do not defer a known sibling to manufacture another
  round.

## FINDING CONTRACT

Assign priority from the evidenced failure's activation, consequence, reach,
reversibility, and detectability:

- **P0:** immediate or structural severe harm, or the central promised outcome
  is absent with broad or difficult recovery.
- **P1:** a normal or credibly reachable path materially misbehaves or omits a
  required outcome.
- **P2:** a realistic uncommon path causes contained correctness or safety
  degradation with practical recovery.
- **P3:** evidenced low consequence that is safely deferrable.

Do not elevate priority merely because the code belongs to a high-risk domain.
`P0` and `critical` require evidence of severe capability, reach, or recovery
cost. A credential label or possible misuse alone does not establish those
facts; when disclosure is proven but privilege or blast radius is unknown, use
the highest supported lower tier and name the uncertainty.

Every finding must include:

```text
[Px] Outcome-level title
Root family
Root cause
Consequence surface
Recurrence
Current evidence
Proof domain: closed | self-bounded | open-world | not-applicable
Incapable mechanism
Consequence
Cascade
Invalidated spec clauses
Required closure
Proof obligations
Correction surface
```

Use exactly one correction surface:

- `implementation-only`: the current contract is sufficient and code must
  change;
- `spec-and-implementation`: current evidence invalidates a task-owned spec
  clause or proof mechanism;
- `evidence-only`: no defect is proven but decision-critical proof is missing;
  or
- `task-decision-required`: closure requires an unmade product,
  compatibility, operational, destructive, or material scope decision.

Do not convert a missing proof into a defect unless providing that proof is an
explicit delivery requirement. Put other blocking gaps under required evidence
with the same correction-surface classification.

If no concrete defect or explicitly required proof deliverable is established,
write `Findings: None`. Keep only convergence-rule-3 `evidence-only` and
`task-decision-required` blockers under required evidence; place non-blocking
unknowns under residual risk. Do not give gaps a P0-P3 finding label. A report
must not simultaneously say that no P0/P1 is proven and emit a P0/P1 finding.

## DONE WHEN

A review is terminal when the current boundary is stable, every bounded
material impact surface is examined or stopped at a named unknown, candidate
findings are challenged, the single final challenge is complete, both coverage
dimensions are reported, and the complete output contract is emitted.

Choose the result in this order:

1. Return `FAIL` on a stable current head when a P0/P1 defect or incomplete
   promised outcome is proven. Known failure wins even if unrelated coverage
   remains partial; report those gaps separately.
2. Otherwise return `INCOMPLETE` only for a convergence-rule-3 blocker. Partial
   coverage labels alone do not decide the result; name the exact material path
   and bounded evidence required. `INCOMPLETE` is not a soft pass or a holding
   state for continued discovery.
3. Otherwise return `PASS` as soon as the bounded work and final challenge are
   complete and no P0/P1 or rule-3 blocker remains. Record P2/P3, non-material
   unknowns, and honestly partial non-blocking coverage as residual merge risk
   without widening the task.

An interrupted review, partial output, or report without an exact reviewed head
has no verdict. `PASS` applies only to the reviewed revision and does not
authorize merge.

## OUTPUT FORMAT

Use a compact report when one bounded surface and short evidence chain preserve
all mandatory content. Use the full profile for multiple surfaces, findings,
material unknowns, or substantial re-review reconciliation. Do not add empty
boilerplate or filler findings.

For a containment-based `PASS`, explicitly account for each plausibly affected
entry route, caller or consumer, executable behavior, permission boundary,
state boundary, external contract, and operational path. Mark a boundary
unchanged or inapplicable only from current evidence; omit unrelated domains.
For incremental reuse, state the exact prior evidence reused, why it is proven
unchanged, and why its prior coverage is adequate for the affected area.

Always return:

```text
## Risk-Calibrated PR Review

Result: PASS | FAIL | INCOMPLETE
Review mode: full | incremental | reset-to-full
Report profile: compact | full
Reviewed revision: <base>...<head>
Current PR head: <revision>
Prior reviewed head: <revision | none>
Overall risk: low | medium | high | critical

Governing outcome
Task scope
Consequence scope
Impact surfaces
Prior finding reconciliation
Required evidence / merge conditions
Findings
Work complete?
Residual merge risk

Coverage
  Task sources
  PR/diff boundary
  Baseline reuse
  Attacked
  Executed
  Not examined
  Artifact coverage: complete | partial
  Invariant coverage: complete | partial
```

Sort findings by priority. If none exists, say so without manufacturing P3
filler. On `FAIL` or `INCOMPLETE`, hand the complete root-family and blocker
batch back for correction, bounded evidence gathering, or a task decision.
Stop after one report and wait for a new invocation against an updated PR or
the exact named evidence; never continue discovery inside the same invocation.
