---
name: risk-calibrated-pr-review
description: "Review a current PR with zero assumed correctness: establish complete task and consequence scope, scale attack depth to evidenced impact, and bind PASS, FAIL, or INCOMPLETE to an exact PR revision. Use as the post-PR hostile merge gate and for evidence-bounded re-review after fixes; not for implementation or pre-PR spec compliance."
---

# risk-calibrated-pr-review

Treat every implementation as unverified, regardless of who or what produced
it. Do not assign an author, tool, team, or reputation a trust or confidence
score. Independently verify intent, completeness, assumptions, integration,
failure behavior, and claimed evidence against the current task and system.

The consequence of a defect controls review depth and finding priority—not
diff size, the apparent simplicity of the edit, or the amount of code involved.
A one-character change can be system-critical; a large mechanical change can
be low risk. Establish the mechanism and its consequences before deciding.

Begin every first review with complete discovery, not with a preselected
criticality tier. Discovery is always thorough enough to bound the task and
its possible consequences; the attack that follows is as deep as those
consequences require. This avoids both shallow averaging and maximum-depth
review theater on contained changes.

Protect users, systems, assets, operators, and other affected stakeholders
without manufacturing findings. High confidence in prose or code is never
evidence. Only current, independently checked facts can support a result.

## When to use

- Use after a PR exists, as the hostile shipping/merge gate that would
  otherwise use `adversarial-diff-review`.
- Use again after every correction round. Each invocation reviews the current
  PR revision, not the remembered result of an earlier run.
- Do not chain or require `adversarial-diff-review`; this skill occupies that
  review role.
- Do not use for plan/spec review or for named-spec pre-PR compliance.
  `review-implementation` remains the separate compliance gate when applicable.
- Do not use to implement fixes, teach or assess the implementer, infer who or
  what wrote the code, approve on the PR host, or merge.

Mentorship is optional and normally omitted. Findings must be actionable, but
the report exists to make the merge safe—not to fill space with teaching prose.

## Read-only boundary

Do not modify project files. Do not commit, push, approve, request changes on
the hosting service, or merge. Safe read-only inspection and diagnostic
execution are allowed; never run a destructive command, a production action,
or a check with material external side effects merely to strengthen a review.

## Inputs

- Require a current PR number or URL, or resolve the PR for the current branch
  when that mapping is unambiguous. Record the exact base and head revision
  identifiers before reading for findings. If no current PR boundary can be
  established, return `INCOMPLETE`.
- Recover the task definition without treating PR-authored agreement as
  independent proof. Use this authority order:
  1. an approved spec, linked issue, accepted plan, or commissioning
     conversation that exists independently of the current diff;
  2. pre-existing system contracts and observed behavior;
  3. the PR description for its declared intent;
  4. when the description is absent, the PR title, branch name, and commit
     messages only for the minimum declared intent they jointly support;
  5. docs, tests, comments, and implementation added or changed by this PR.
  Lower sources may clarify intent but cannot silently override higher ones.
  When no higher task source exists, the PR description may define the
  requested outcome. Sparse metadata may establish a narrower minimum outcome,
  but must not be expanded into unstated acceptance criteria. Neither source
  proves its claims about existing system, external, or safety behavior.
  Artifacts changed together in the PR remain correlated claims even when they
  agree. If authoritative sources conflict, or a material correctness claim
  depends only on circular PR-authored corroboration and cannot be checked
  against the declared outcome or observed system, return `INCOMPLETE` and
  name the unresolved claim.
- On re-review, require the complete prior report and the exact head revision
  it reviewed when they are not already in the current conversation or
  artifacts. A summary or unbound report cannot support incremental reuse. If
  either is unavailable, perform a full fresh review.

Never ask the human to label the PR's criticality. Inferring consequence and
criticality from the task, diff, codebase, and operational behavior is part of
this skill's job. Ask for a missing fact only when it cannot be recovered and
its answer changes whether the implementation is correct; until then, the
result is `INCOMPLETE`, not an average-risk guess.

Before returning, resolve the PR head again. If it changed during the review,
restart against the new revision or return `INCOMPLETE`; never attach a result
to code that was not reviewed.

## Unverified implementation posture

Use these as starting hypotheses about code, not labels for its producer:

- Locally coherent reasoning can rest on a globally false premise.
- Plausible-looking assumptions about APIs, contracts, schemas, configuration,
  framework behavior, business rules, deployment, or runtime state may be
  absent or false.
- Tests can encode the same misconception as the implementation, assert the
  implementation instead of the requirement, or pass without exercising the
  failure mechanism.
- A working happy path says nothing by itself about empty input, invalid state,
  retries, reentrancy, concurrency, partial completion, timeouts, rollback, or
  recovery.
- Clean structure, convincing names, comments, extensive tests, and green CI
  are claims or supporting signals; none independently proves correctness.

Do not turn this list into automatic findings. Trace each applicable
hypothesis to the task and current system, then prove or kill it with evidence.

## Establish two scopes

On every first review, rebuild both scopes completely from current evidence
before deciding how deep the attack must go:

1. **Task scope — what must change.** Extract the promised outcome, acceptance
   behavior, explicit non-goals, and each hunk's claimed purpose.
2. **Consequence scope — what can be harmed.** Trace the changed behavior
   through entry points, callers and consumers, durable state, money or data
   movement, permission boundaries, external contracts, operational controls,
   rollout, rollback, and recovery.

These scopes are different. A tiny task can have a large consequence scope.
An extensive diff can still be operationally contained.

Read the complete current PR diff and the full changed files needed to
understand it. Inspect relevant callers, tests, configuration, schema,
policies, contracts, and history outside the diff where the consequence path
leads. PR prose, comments, tests, and implementation claims are hypotheses;
current repository contracts and observed behavior are evidence.

Partition the PR into distinct **impact surfaces**. For each surface, record:

- the user or business outcome it can affect;
- the state, control boundary, or external behavior that changes;
- one activation state: `live`, `conditional`, `dormant/support-only`, or
  `unknown`, plus the concrete caller, configuration, rollout step, or other
  prerequisite that activates it;
- the worst credible failure path and how it activates;
- affected reach;
- reversibility and recovery cost;
- detectability and containment;
- material unknowns.

Examples such as payments, authentication, authorization, personal data,
destructive operations, migrations, and availability are signals—not a closed
checklist. Follow the actual consequence path.

## Determine criticality

Assign each impact surface exactly one tier, then set the PR's overall tier to
the highest credible surface tier:

- **low** — failure is cosmetic or tightly local, has limited reach, is quickly
  reversible, and does not cross a durable-state or trust boundary;
- **medium** — failure causes real functional degradation or integration/state
  errors, but its reach is contained and recovery is routine;
- **high** — failure can cause material user, stakeholder, or system harm
  involving money, access, privacy, data integrity, availability, compliance,
  or another high-value outcome; reach, silent failure, or recovery difficulty
  is significant;
- **critical** — a concrete activation path can cause severe, widespread, or
  difficult-to-reverse financial, security, privacy, data, legal, or
  operational harm.

Apply these rules:

- Do not average surfaces or risk dimensions. Many harmless hunks cannot dilute
  one credible critical path.
- "Credible" requires a concrete mechanism. A subsystem name alone does not
  make a finding or tier critical.
- Diff size and line count affect inspection effort, not business criticality.
- A typo on a payment surface is severe only if its mechanism can block,
  misroute, duplicate, or otherwise corrupt payment behavior. Judge the
  consequence, not the visual size of the mistake.
- `live` is reachable in current operation. `conditional` is reachable through
  a current documented trigger or configuration. `dormant/support-only` has no
  current production caller but may be intended for later activation.
  Dormancy rules out claims of immediate production harm, not latent harm:
  record what must activate it and judge the task's exposure at that point.
  It earns `critical` only when a concrete committed activation path can
  produce critical consequences before safe containment.
- `unknown` activation is not a middle tier. If resolving it could materially
  raise the tier or attack depth, use the lowest defensible tier, record the
  upward uncertainty, and return `INCOMPLETE`.
- Producer identity, credentials, tooling, and apparent confidence never
  change the tier or finding priority.
- Select `low` only when evidence shows why failure is contained.
- If missing evidence could materially raise the tier, state the lowest
  defensible tier, identify the upward uncertainty, and make the result
  `INCOMPLETE`. Never silently default uncertainty to `medium`.

## Scale the attack

Complete discovery is mandatory on every first review. After discovery, review
each surface at the depth its consequence warrants. A critical PR does not
require wasting critical-depth effort on an unrelated low-risk documentation
hunk; coupling between surfaces can raise their depth.

- **Low:** verify task-to-diff completeness, hunk justification, direct
  consumers, and the smallest relevant check. Stop when the bounded behavior
  and containment claim hold. Do not perform a speculative architecture hunt
  or mine style findings.
- **Medium:** also trace integration points and shared consumers; attack
  realistic empty, error, state-transition, retry, and compatibility paths;
  run relevant targeted tests.
- **High:** also verify end-to-end business and safety invariants across the
  diff boundary. Where relevant, attack authorization, isolation,
  transactions, idempotency, concurrency, partial completion, rollback,
  migration, configuration, deployment, and external-contract behavior.
  Exercise focused failure paths rather than trusting happy-path tests.
- **Critical:** independently substantiate every material safety claim with
  the strongest safe evidence available. Verify recovery, containment,
  observability/detection, rollout and rollback assumptions, and critical
  dependency behavior. An unexercised critical invariant or unavailable
  material evidence makes coverage partial and the result `INCOMPLETE`.

Coverage is complete when the current task boundary, complete diff, and every
tier-appropriate material attack angle have been examined. It never means
"read the entire repository." Review depth varies; honesty about coverage does
not.

Discovery is complete—not exhaustive—only when:

- every changed file and hunk is inventoried as required, supporting,
  unrelated, or unexplained and mapped to an impact surface;
- every changed entry point, contract, state boundary, and operational hook is
  assigned an activation state;
- each material consequence trace reaches a concrete consumer, containment
  boundary, or named unknown; and
- every tier-appropriate attack angle is marked examined, not applicable with
  reason, or blocked on named evidence.

This does not require reading unrelated repository code or pursuing a
speculative path after its containment is evidenced. Stop when that inventory
is adjudicated. If repository evidence and safe focused diagnostics cannot
close a material item, put it under `Required evidence / merge conditions` and
`Not examined`, then return `INCOMPLETE`; do not keep expanding the search to
look thorough.

## Review procedure

Work in this order:

1. Rebuild the current PR boundary, task scope, and consequence scope.
2. Record the exact base and head revision. Produce the impact-surface map and
   choose the risk tier before assigning finding priorities.
3. **Task → diff:** map every required behavior to implementation and observed
   evidence. Find omissions, partial delivery, and near-misses.
4. **Diff → task:** justify every hunk. Treat unrelated refactors and bundled
   cleanup as unreviewed scope, not free improvements.
5. **Diff → system:** follow changed contracts, callers, consumers, state, and
   operational paths beyond the diff. The dangerous breakage may live outside
   the submitted diff.
6. Attack the failure modes selected by the impact tier. Do not run a rote
   universal checklist or assume the happy path is representative.
7. Prefer observed behavior over source inference when a safe focused command
   can decide the question. Before accepting a test, doc, or example as
   evidence, state the expected invariant and its authority. Corroborate
   material PR-authored claims with an independently approved task source, a
   pre-existing caller or contract, an authoritative external contract, or a
   counterexample/fault injection that distinguishes the requirement from the
   implementation's premise. Inspect whether each relevant test would fail
   when that invariant is violated. Agreement among implementation and tests
   changed in the same PR is not an independent oracle. If no independent
   basis can decide a material correctness choice, record required evidence
   and return `INCOMPLETE`. Inspect current CI/check results and run relevant
   tests, but do not treat green checks as proof of untested invariants.
8. Challenge each candidate finding. If there is no exact evidence and failure
   mechanism, either gather the missing evidence or record a coverage gap;
   never promote suspicion into a finding.
9. Resolve the PR head again before reporting. Restart or return `INCOMPLETE`
   if the reviewed revision is no longer current.

For omissions, evidence may be the authoritative requirement plus the searched
implementation locations or missing registration point. For present code,
cite the exact current `file:line` or diff hunk.

Low-risk work should converge quickly after its bounded attack survives. Do
not prolong a review to look thorough. High-risk work should not pass because
the easy parts looked clean.

## Re-review after fixes

A re-review is never automatically shallower. Reuse prior coverage only when
revision evidence proves that the covered behavior is unchanged.

First choose the mode:

- **incremental** only when the prior reviewed head is known, its relationship
  to the current head is provable, the task and PR purpose are unchanged, the
  delta is bounded, and no new impact surface or material invariant appeared;
- **reset-to-full** when the prior revision is unknown or not safely
  comparable, the base or task changed materially, the delta introduces a new
  surface, fixes reshape a high/critical invariant, prior coverage was
  insufficient for the affected area, or the changes are too tangled to
  isolate safely.

For an eligible incremental re-review:

1. Reread the current task sources and PR metadata. Compare the complete delta
   from the prior reviewed head to the current head.
2. Reconcile every prior finding as `resolved`, `still present`, or
   `superseded`, using current evidence. Do not carry forward old text.
3. Verify the actual correction mechanism, the independence of its test
   oracle, and relevant failure paths. A changed line or green test is not
   proof that the failure is closed.
4. Attack every new hunk, its affected callers/contracts/invariants, and all
   previously declared coverage gaps.
5. Sweep the complete current PR boundary for unreviewed or unexpected changes.
   Reuse only areas proven unchanged from the recorded baseline.
6. Recompute impact surfaces and criticality where the delta can affect them.
   Switch to `reset-to-full` immediately if incremental eligibility fails.
7. Resolve the head revision again before reporting.

Converge honestly. Do not revive resolved findings, widen the task without
evidence, or invent low-value issues to keep the loop alive. Any implementation
change after a `PASS` invalidates that result. The human fixes findings and
invokes this skill again; this skill never fixes and certifies its own work.

## Priority

PR criticality and finding priority are related but distinct. PR criticality
sets attack depth. Finding priority comes from the evidenced failure's
activation likelihood, consequence, reach, reversibility, and detectability:

- **[P0]** Merging creates an immediate or structural threat to working
  critical behavior, or the PR's central purpose is absent. The
  credible consequence is severe, broad, or difficult to reverse.
- **[P1]** A normal or credibly reachable path materially misbehaves, or a
  required behavior is missing or wrong. This includes concrete financial,
  access, privacy, data, availability, or compliance harm even when the faulty
  edit is tiny.
- **[P2]** A realistic but uncommon path degrades correctness or safety with
  contained reach or practical recovery.
- **[P3]** The evidenced consequence is low and safely deferrable.

Do not elevate a finding merely because it sits in a high-risk subsystem.
Criticality demands deeper proof; the failure mechanism earns the priority.
Do not balance counts across levels, rank by indignation, or report style
preferences as safety findings.

## Output

Review mode and report profile are separate axes: `full` review mode means no
baseline coverage was reused, while `full` report profile means the expanded
output structure was necessary.

Choose `compact` when the boundary is small, coverage is complete, and the
result can be supported without hiding multiple surfaces, material
uncertainty, or a long reconciliation. Consequence severity alone does not
force a long report. Use `full` otherwise. Both profiles must preserve result,
mode, exact revisions, risk and activation rationale, findings, work
completeness, required evidence, and coverage. A compact report may combine
sections and omit empty boilerplate; it may not omit evidence needed to audit
the gate.

Return this full structure, with findings sorted by priority:

```
## Risk-Calibrated PR Review

Result: PASS | FAIL | INCOMPLETE
Review mode: full | incremental | reset-to-full
Report profile: compact | full
Reviewed revision: <base revision>...<head revision>
Prior reviewed head: <revision or none>
Overall risk: low | medium | high | critical

### Criticality profile
Task scope: <what the PR must accomplish>
Consequence scope: <what can be harmed if it is wrong>
Impact surfaces:
- <surface>: <tier; activation state, prerequisite, and concrete mechanism>
Worst credible consequence: <evidenced outcome>
Material uncertainty: <none or unresolved upward risk>
Applied depth: <how the tier changed the attack>

### Prior finding reconciliation
<re-review only: each prior finding as resolved | still present | superseded>

### Required evidence / merge conditions
<none, or one item per material gap: ID; impact surface; unresolved invariant;
why it blocks the result; exact evidence or safe check that would close it>

### Findings

[Px] <short title>
Evidence: <current file:line, diff hunk, or omission evidence>
Mechanism: <how the failure activates>
Consequence: <user, business, financial, security, data, or operational result>
Cascade: <what else breaks; required for P0/P1>
Resolution: <required correction; describe, do not implement>
Verification: <evidence that would prove the correction>

### Work complete?
yes | no | unknown — <why>

### Residual merge risk
<remaining P2/P3 items, assumptions, or "none identified">

### Coverage
Task sources: <current authoritative sources>
PR/diff boundary: <exact current boundary>
Baseline reuse: <areas proven unchanged and reused, or none>
Attacked: <surfaces and failure paths genuinely examined>
Executed: <commands, tests, and checks actually run>
Not examined: <skipped files, unavailable systems, or none>
Coverage: complete | partial
```

If there are no findings, say so plainly; do not create P3 filler.
For a compact report, retain the header fields and express the same mandatory
content in short labeled paragraphs. Include prior-head reconciliation when
re-reviewing and say `Required evidence: none` when none is missing.

## Result gates

Apply these gates in order:

1. If the current PR boundary or head cannot be stabilized, return
   `INCOMPLETE`; a finding cannot be bound to unknown code.
2. On a stable head, return **FAIL** when one or more current P0/P1 findings
   exist or evidence proves the promised work is incomplete. Known failure
   wins even if other coverage remains partial; report those gaps separately.
3. Otherwise return **INCOMPLETE** when coverage is partial, material
   criticality or correctness remains unresolved, or any required evidence
   item remains open. Missing proof is a coverage gap, not a defect finding,
   unless supplying that artifact is itself an explicit delivery requirement.
   `INCOMPLETE` is not a soft pass.
4. Otherwise return **PASS** only when coverage is complete at the declared
   risk depth, the work is complete, material criticality is resolved, and no
   current P0/P1 remains. Report any P2/P3 as residual risk for the human
   decision. Bind `PASS` only to the exact reviewed head revision.

`PASS` means the current implementation survived this hostile merge gate. It
does not authorize merge, approve the PR on the host, or award Ready-for-PR.
The human owns the merge decision. No trust accumulates across revisions;
only unchanged evidence tied to an exact baseline may be reused.

## Validation

The draft achieves its purpose only when a separate reviewer can reproduce all
of these behavior checks:

| Case | Required observable result |
| --- | --- |
| Tiny manifest diff removes the sole dependency required before every live service instance can start; merging triggers an automatic rolling rollout that replaces the full fleet, every replacement fails startup, no alternate serving path or automated rollback exists, and recovery requires rebuilding and redeploying the image | Review mode `full`, overall risk `critical`, result `FAIL`, exact P0 evidence and complete coverage; compact report profile is allowed and no filler finding appears. |
| Large database-support PR has no current production caller or flag, but is the approved persistence path for a separately reviewed later release; it claims concurrency-safe ownership over shared financial reservation rows, and if that invariant is wrong concurrent execution can silently duplicate ownership across accounts and require manual repair, while material real-database/concurrency evidence to decide the invariant is omitted | Activation is `dormant/support-only`, immediate production harm is not claimed, overall risk is `high`, result is `INCOMPLETE`, missing checks appear as required evidence, and the report terminates with named unexamined items. |
| Passing tests encode the implementation's false premise | The tests are rejected as an independent oracle; the violated external or pre-existing invariant controls the finding or required-evidence decision. |
| Fix-only revision has exact ancestry, unchanged task, and no new surface | `incremental`; every prior finding is reconciled and only evidence proven unchanged is reused. |
| Later revision adds a new state or authorization surface | `reset-to-full`; the new surface receives complete discovery before a result. |
| PR head changes during review | Restart against the new head or return `INCOMPLETE`; never emit a result bound to the stale head. |

Validation fails if author identity changes the result, if green CI alone
produces `PASS`, if a small diff defaults to low risk, if a large diff causes
unbounded searching, or if empty output sections obscure the decisive
evidence.

## Stop

Stop after one complete report. On `FAIL` or `INCOMPLETE`, hand the complete
report back for human-owned correction or evidence gathering, then wait for a
new invocation against the updated PR. On `PASS`, stop for the human merge
decision.
