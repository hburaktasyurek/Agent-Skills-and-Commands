---
name: spec-readiness
description: "Check whether a named implementation specification is ready to hand to an implementer without forcing them to invent structural contracts. Use explicitly before implementation handoff to return READY or root-complete NOT READY blockers. Do not use as a runtime correctness or PR merge review."
---

# Spec Readiness

Review the current spec from the implementer's chair:

> If implementation started tomorrow, where would the implementer have to
> choose a contract the spec should already have chosen?

Review artifacts, not the author. Read only; do not edit the spec or code.

## Structural threshold

A missing choice is a Blocker only when different answers change a declared
work package, consumer, or observable contract through data, control,
identity, ownership, authority, persisted state, lifecycle, compatibility,
recovery, side effects, or acceptance behavior.

A choice is implementation freedom when alternatives remain inside one
component and preserve every boundary and observable obligation. Private
algorithms, helper names, local refactors, and hypothetical consumers are not
Blockers unless the binding artifacts make them load-bearing.

State activation or rollout timing only when a binding artifact defines it.
Do not infer that activation is immediate merely because a code change would
be deployed.

## Review basis

1. Resolve and reread the exact current spec and directly binding artifacts.
   Record paths and content/revision identity. For Git artifacts, distinguish
   staged and worktree content when they differ. If Git identity inspection is
   unavailable, record that limitation after one attempt; do not retry
   equivalent commands.
2. State the binding task contract: authority, outcome, scope, non-goals,
   acceptance/stop conditions, ordered work packages, and relevant migration,
   rollback, recovery, or activation state.
3. Use `full` mode by default. A claimed re-review is `incremental` only with
   the complete prior report, exact unchanged basis, unchanged task contract,
   and a correction-only delta. Otherwise use `reset-to-full`. For a re-review,
   read [references/incremental-review.md](references/incremental-review.md).

If no identifiable current spec exists, return `NOT READY` with the missing
basis and stop. Do not reconstruct a spec from guesses.

## Contract ledger

Create a private node for every independently owned work package and a directed
edge for every producer-consumer or authority handoff. For every applicable
node and edge classify these rows:

| Row | Required contract |
|---|---|
| Owner and outcome | Entry point, owner, dependencies, construction, registration, transaction/lifecycle owner, promised outcome |
| Inputs and authority | Shapes, preconditions, context, canonical source when inputs or facts disagree |
| Public contract and identity | Cross-task types, creation authority, states, payloads, equality and identity meaning |
| Outcomes | Success, no-op, replay, denial, conflict, missing/malformed data, failure, rollback, retry and exhaustion |
| State and effects | Pre/post state, exact records, persistence, side effects, ordering, compatibility, activation and recovery |
| Proof | Acceptance criterion, observation point, distinguishing counterexample and test oracle |

Classify each applicable row as exactly one:

- `SPECIFIED`: current artifacts select one coherent contract;
- `IMPLEMENTATION_FREEDOM`: alternatives preserve all boundaries and outcomes;
- `KNOWN_UNKNOWN`: explicitly owned and bounded without blocking current work;
- `MISSING_STRUCTURAL_DECISION`: implementation must choose an unspecified
  boundary contract.

Do not classify a whole node as complete because an endpoint or happy path is
named.

## Conditional depth

Apply only the gates triggered by the ledger. When the spec crosses a public
type/identity, multi-component construction/ownership, or durable/concurrent
state boundary, read
[references/structural-gates.md](references/structural-gates.md) and apply the
matching section. A one-node local edit need not answer database, rollout,
concurrency, or public-API questions.

Traverse work packages in dependency order. For each missing decision, trace
all dependent producers, consumers, states, errors, tests, and downstream
tasks. Group manifestations under the earliest missing canonical contract.
Split findings only when the choices can vary independently. A conflict
outcome, acceptance gap, or downstream consumer consequence caused by the
same missing canonical contract stays in that Blocker's decision family; do
not emit it as another Blocker.

Run each acceptance criterion and terminal mutation backward:

`result -> mutation -> proof/snapshot -> observation -> source/identity`

Verify that every required hop exists, keeps the binding identity and
authority, and has an observable counterexample. Each acceptance assertion
must observe a counterexample that can distinguish competing contracts; a
green suite or happy-path sample proves only what it asserts. Stop only after all nodes,
edges, applicable rows, acceptance paths, and triggered reverse paths have
been checked. Keep the review proportional.

## Verdict and output

Open with exactly `READY` or `NOT READY`. `READY` requires zero Blockers and
only explicitly owned, bounded known unknowns. Never use "ready with caveats."

Then report:

```text
Review mode: full | incremental | reset-to-full
Artifact basis: <paths and exact content/revision identity or limitation>
Task contract: <outcome, scope, work packages, activation and non-goals>
```

For each finding use:

```text
[Blocker | Gap | Note] <title>
Evidence: <current path:line/section or inline clause>
Task(s) / handoff: <affected nodes and edge>
Missing decision: <what the implementer would otherwise choose>
Why structural: <boundary or observable contract that changes>
Consequence: <how implementations diverge or fail>
Decision family / cascade: <dependent in-scope surfaces>
Required closure: <what the spec must decide without prescribing excess mechanism>
Verification: <distinguishing proof>
```

All fields are required for Blockers. A Gap is bounded local ambiguity or weak
evidence that may cause rework but does not force a structural boundary choice.
A Note is minor clarity loss with an obvious local resolution.

Close with:

```text
Coverage receipt: <nodes/edges, ledger coverage, triggered gates, acceptance paths, reverse pass, limitations>
Checked and solid: <only contracts whose complete ledger rows survived>
Next: revise-spec-from-review | implementation
```

Do not prescribe architecture when several contracts satisfy the outcome.
Route plan correctness to `adversarial-spec-review` and runtime/PR correctness
to the corresponding review skill.
