---
name: spec-readiness
description: Check whether every implementation task can start without inventing a structural contract. Use before handoff to implementation.
---

Review the current spec from the implementer's chair:

> If implementation started tomorrow, where would the implementer have to
> choose a contract the spec should already have chosen?

Presume the spec is not ready until the contract ledger and reverse pass below
are complete. Review the artifacts, not the author.

This is not a runtime kill-test. `adversarial-spec-review` tests whether the
plan can safely achieve its outcome. This skill tests whether that plan is
explicit enough to implement without inventing contracts.

Do not modify files. Produce analysis only.

## Structural threshold

A decision is structural when different answers change at least one of:

- data, control, identity, ownership, or authority crossing a declared work
  package, component, or consumer boundary;
- a public or cross-task type, method, result, error, event, persisted state,
  side effect, or lifecycle meaning;
- construction, transaction, activation, compatibility, recovery, or an
  observable acceptance condition another task relies on.

A choice is implementation freedom only when alternatives remain inside one
component and preserve every boundary, persisted meaning, and acceptance
condition. Local algorithms, names, private helpers, indexes, and refactorings
are not Blockers unless the spec makes them load-bearing across a boundary.

Do not invent hypothetical consumers from a public-looking name. Use declared
work packages, binding compatibility obligations, and consumers required by
acceptance. An absence is a Blocker only after proving that implementation
needs the decision and different answers change a structural boundary.

## 1. Freeze the review basis and mode

1. Resolve and reread the exact current spec artifacts end to end. Read
   directly referenced task, parent, code, test, schema, configuration,
   history, or external material only to establish an implementation contract
   or prove that a choice remains open.
2. For Git artifacts, inspect status, staged and unstaged spec diffs, relevant
   log, and any commit diff needed to identify reviewed state. Record reviewed
   paths, `HEAD`, scoped dirty state, and each artifact's exact content
   identity; identify staged and worktree contents separately when they differ.
   Do not inspect an unrelated checkout for an inline artifact.
3. Derive the binding task contract: task identity and authority, outcome,
   scope and non-goals, acceptance and stop conditions, ordered work packages,
   and any current, gated, migration, rollback, or recovery state that changes
   a handoff.
4. Select one mode:
   - `full` when the invocation is not presented as a re-review;
   - `incremental` only when the caller supplies current spec path/content and
     the complete prior report unchanged with its exact artifact basis; task
     identity, scope, and acceptance are unchanged; and every current change
     is a finding correction or required consequence;
   - `reset-to-full` for every other re-review, including an incomplete or
     mismatched handoff, new work package, public type, dependency, ownership
     or persistence boundary, activation path, or unexplained change.

It is a re-review when the caller supplies a prior report, calls the run a
rerun/recheck, or identifies current changes as prior-finding corrections. A
path, revision summary, or old finding list is not a complete incremental
handoff. History and diffs locate evidence; always reread current artifacts.

## 2. Complete the implementation contract ledger

Build the complete private ledger before reporting findings.

Create one node for every implementation work package or independently owned
deliverable. Create one directed edge for every producer-to-consumer handoff.
Also create edges between observation, proof, and mutation stages inside one
component when authority can change between those stages.

For every node and edge, record all applicable rows:

| Row | Required contract |
|---|---|
| Owner and outcome | Concrete owner, entry point, promised outcome, construction, registration, dependencies, and transaction/lifecycle owner |
| Inputs and authority | Accepted shapes, preconditions, context, and the authoritative source when caller input, persisted state, and external facts can disagree |
| Public contract and identity | Cross-task types, creation authority, observable fields, closed states, valid payloads, and identity/equality semantics |
| Outcomes | Success, no-op, replay, denial, conflict, missing/malformed data, failure, rollback, retry, and exhaustion outcomes that a consumer must distinguish |
| State and effects | Authoritative pre/post state, exact records, persistence, side effects, ordering, compatibility, activation, and recovery obligations |
| Proof | Acceptance criterion, observation point, distinguishing counterexample, and test oracle |

Classify every necessary ledger entry as exactly one:

- `SPECIFIED` — current artifacts give one coherent contract;
- `IMPLEMENTATION_FREEDOM` — alternatives preserve every boundary and
  observable obligation;
- `KNOWN_UNKNOWN` — explicitly owned, bounded, and compatible with starting
  current work;
- `MISSING_STRUCTURAL_DECISION` — implementation cannot proceed without
  choosing an unspecified boundary contract.

Do not classify an entire node as solid because its endpoint is named. Each
applicable ledger row must be classified.

## 3. Apply mechanism-triggered gates

Apply only gates triggered by the ledger. A one-node local edit need not answer
database, concurrency, rollout, or public-API questions.

### Cross-boundary type and identity

For each type crossing an edge, require enough contract for every declared
producer and consumer: owning file/package when relevant, factory or hydration
authority, accepted shapes, observable accessors, closed states/codes, and
valid state-payload combinations.

When an identity is independently produced, stored, recomputed, or compared
across nodes, require:

- exact input domain and canonical representation;
- exact bytes/algorithm when more than one node must reproduce the value;
- persisted representation and scope;
- equality and recomputation rule;
- collision, alias, and uniqueness-conflict outcome.

“Derived from X,” “stable,” “fingerprint,” “digest,” or an injectivity claim is
not an implementable identity contract without those answers. Do not require
this for a private identity that never leaves one node.

### Ownership, construction, and outcomes

When more than one component could own an operation, require one orchestration
and transaction/lifecycle owner, every collaborator and context it needs, and
the layers that validate, persist, publish, map, and return. Standalone and
composed entry points must not accidentally duplicate or nest ownership.

For each cross-boundary operation, build a condition-to-outcome table. Each
applicable condition must choose exactly one return/result or thrown error,
payload, committed or rolled-back state, side effects, retry eligibility, and
consumer action. “Throw or return blocked” leaves a structural decision
missing. A happy-path test does not close the other rows.

### Persisted or concurrent authority continuity

When persisted or concurrent state authorizes a result or mutation, complete
one row for every terminal mutation:

```text
source state/identity
→ observation
→ typed proof or locked snapshot
→ mutation
→ result and acceptance oracle
```

The row must state:

- exact records and canonical identity at every hop;
- applicable synchronization, version, lease, lock, or visibility guarantee
  and which state changes before, between, or after observations can be seen;
- proof/snapshot fields and complete set-membership meaning;
- whether mutation consumes exactly that proof without re-querying, widening
  the set, substituting identity, or dropping a member;
- applicable typed stale/conflict/storage outcomes, retry unit and limit,
  exhaustion outcome, and rollback/compensation meaning;
- one distinguishing concurrent schedule or counterexample.

If mutation re-queries or uses a broader selector, the spec must define
mutation-time membership, visible changes, affected members, and observable
outcome. Require exclusion or an observable stale abort only when the binding
outcome says mutation must consume the proved set. “Revalidate” without the
applicable visibility schedule and outcome does not close the row. Mark a
field `N/A` only with a domain-specific reason. Require a particular mechanism
only when the binding contract depends on it; otherwise require the guarantee,
not one implementation.

### Acceptance evidence

Trace each acceptance assertion to the exact graph observation that can
distinguish relevant counterexamples. A mock call, row count, sample, green
suite, or repeated implementation assumption proves only what it observes.

## 4. Close decision families and reverse the graph

Traverse nodes in implementation dependency order, acting as an implementer
with only current artifacts:

1. Find the next ledger entry required to implement the node.
2. Locate its specified contract or prove legitimate implementation freedom.
3. For a missing structural decision, trace every producer, consumer, state,
   error, constructor, test, and downstream task that depends on it.
4. Find the earliest missing canonical contract explaining those
   manifestations and group them into one decision family with one falsifiable
   closure condition.

Do not return one symptom per review round. Split findings only when choices
can vary independently or require different human decisions.

Then run every acceptance criterion and terminal mutation backward:

`result → mutation → proof/snapshot → observation → source/canonical identity`

Verify that no hop is missing, recomputed under another identity, broader than
the binding membership or authorization contract permits, or unobservable
under declared visibility. Exercise the distinguishing input or concurrent
schedule for every triggered chain.

For one bounded artifact with no cross-task/component edge, the graph may have
one node. A focused scope, acceptance, and counterexample check may finish the
review; do not force irrelevant gates.

## 5. Re-review

In `incremental` mode:

1. Reconcile every prior finding as `resolved`, `still present`, or
   `superseded`, using current artifacts.
2. Verify each correction across its full decision family and changed edges.
3. Rebuild changed, interacting, and previously unproved ledger rows.
4. Run the reverse pass once.

Neither carry a finding because it existed nor resolve it because wording
changed. If Step 1 eligibility ceases, switch to `reset-to-full` and perform the
full-review procedure.

## 6. Stop

A review is complete only when:

- every work package has a node and every required handoff has an edge;
- every applicable ledger row is classified;
- each Blocker is one root-complete decision family;
- each acceptance criterion has an observable proof path;
- every triggered authority-continuity row is complete;
- the reverse pass finds no new Blocker family.

Reconfirm the artifact basis before returning. If it changed, reread affected
artifacts and rebuild the affected graph, or restart. Stop after the ledger and
reverse pass are complete; do not widen scope, revive resolved findings, or
mine Gaps and Notes to keep the loop alive.

## Severity and verdict

- **Blocker:** a `MISSING_STRUCTURAL_DECISION`; alternatives change another
  node, persisted/public meaning, or acceptance outcome.
- **Gap:** bounded local ambiguity or weak evidence that may cause rework but
  does not force a structural boundary choice.
- **Note:** minor clarity loss with an obvious local resolution.

Open with exactly `READY` or `NOT READY`. `READY` requires zero Blockers and
only explicitly owned, bounded known unknowns. Do not use “ready with caveats.”

Then report:

```text
Review mode: full | incremental | reset-to-full
Artifact basis: <paths, exact content identities, Git state or limitation>
Task contract: <outcome, scope, packages, activation and non-goals>
```

On re-review, add compact prior-finding reconciliation. Report current findings
in severity order:

```text
[Severity] <short title>
Evidence: <exact current path:line/section or inline clause>
Task(s) / handoff: <affected nodes and edge>
Missing decision: <what the implementer would otherwise choose>
Why structural: <which boundary or observable contract changes>
Consequence: <what diverges or fails when implementations choose differently>
Decision family / cascade: <all dependent contract surfaces>
Required closure: <what the spec must decide, without excess mechanism>
Verification: <distinguishing proof that the closed contract works>
```

All fields are required for Blockers. Gaps and Notes may combine fields when
no decision-relevant information is lost.

Close with:

```text
Coverage receipt: <node/edge counts, ledger classification coverage, triggered
gates and continuity rows, acceptance paths, reverse pass, limitations, stop>
Checked and solid: <only contracts whose complete ledger rows and
distinguishing counterexamples survived>
Next: revise-spec-from-review | implementation
```

Keep the report proportional.

## Boundaries

- Read-only: no spec, code, Git, PR, or workflow mutation.
- Do not implement the spec or prescribe architecture when several contracts
  satisfy the binding outcome.
- Review runtime failures only when they expose a missing implementation
  contract; route plan correctness to `adversarial-spec-review`.
- Stay within declared work and contracts it necessarily depends on.
- Existing code, conventions, names, and green tests are not future contracts
  unless binding artifacts adopt them or compatibility requires them.
- Do not use numeric confidence, finding quotas, or author capability.
- A re-review may assess same-conversation corrections only from reread current
  artifacts; proposed, remembered, or described corrections are not evidence.
