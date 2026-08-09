---
name: risk-calibrated-pr-review
description: "Use only when explicitly invoked as `$risk-calibrated-pr-review` or equivalent to independently review a current implementation PR as a read-only hostile merge gate. Reconstruct the governing task and consequence scope, scale attack depth to evidenced risk, diagnose root causes and proof gaps, and return PASS, FAIL, or INCOMPLETE bound to the exact reviewed base and head. Use after a PR exists and for re-review after fixes; not for spec review, implementation, pre-PR compliance, commit-history process analysis, or general PR summaries."
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
   gather the missing evidence or record a coverage gap.
10. Resolve the PR head again before reporting. If it changed, restart against
    the new revision or return `INCOMPLETE`; never attach a verdict or coverage
    from the old head to the new one. In an `INCOMPLETE` report, distinguish
    the last revision actually reviewed from the unreviewed current PR head.

Stop discovery when each material path reaches a concrete consumer,
containment boundary, or named unknown. Do not search indefinitely to look
thorough.

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
write `Findings: None`. Keep `evidence-only` and `task-decision-required` gaps
under required evidence; do not give those gaps a P0-P3 finding label. A report
must not simultaneously say that no P0/P1 is proven and emit a P0/P1 finding.

## DONE WHEN

A review is terminal only when the current boundary is stable, material impact
surfaces are examined or named as unknowns, candidate findings are challenged,
both coverage dimensions are reported, and the complete output contract is
emitted.

Choose the result in this order:

1. Return `FAIL` on a stable current head when a P0/P1 defect or incomplete
   promised outcome is proven. Known failure wins even if unrelated coverage
   remains partial; report those gaps separately.
2. Otherwise return `INCOMPLETE` when revision stability, controlling
   authority, compatibility, material evidence, artifact coverage, or invariant
   coverage remains unresolved. `INCOMPLETE` is not a soft pass.
3. Otherwise return `PASS` only when the work is complete, artifact and
   invariant coverage are complete at the declared risk depth, material
   uncertainty is resolved, and no P0/P1 remains.

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
filler. On `FAIL` or `INCOMPLETE`, hand the complete report back for correction,
evidence gathering, or a task decision. Stop after one report and wait for a
new invocation against an updated PR.
