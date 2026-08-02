# Structural gates

Apply only sections triggered by the contract ledger. Require the guarantee
the binding task needs, not a preferred implementation mechanism.

## Cross-boundary type and identity

For each type crossing a declared edge, require enough contract for every
producer and consumer: owner, construction/hydration authority, accepted
shapes, observable fields, closed states or codes, and valid state-payload
combinations.

When identity is independently produced, stored, recomputed, or compared
across nodes, require:

- exact input domain and canonical representation;
- exact bytes/algorithm when multiple nodes must reproduce it;
- persisted representation and scope;
- equality and recomputation rule;
- collision, alias, and uniqueness-conflict outcome.

Words such as "derived", "stable", "fingerprint", or "digest" do not close a
cross-node identity contract. Do not require these details for a private
identity that never leaves one node.

## Ownership, construction, and outcomes

When multiple components could own an operation, require one orchestration and
transaction/lifecycle owner, its collaborators and context, and the layers
that validate, persist, publish, map, and return. Standalone and composed entry
points must not accidentally duplicate or nest ownership.

For each cross-boundary operation, build a condition-to-outcome table. Each
applicable condition selects one result or error, payload, committed or rolled
back state, side effects, retry eligibility, exhaustion result, and consumer
action. "Throw or return blocked" leaves a structural decision open.

Construction and dependency acquisition are part of reachability. If an
outcome must survive an unavailable dependency, the production entry path
cannot require that dependency before reaching the surviving branch.

## Persisted or concurrent authority continuity

For every terminal mutation authorized by persisted or concurrent state,
complete:

```text
source state/identity
-> observation
-> typed proof or locked snapshot
-> mutation
-> result and acceptance oracle
```

State the exact records and canonical identity at every hop; applicable lock,
version, lease, synchronization, and visibility guarantees; proof membership;
whether mutation consumes that proof without re-querying or widening; stale,
conflict, storage, retry, exhaustion, rollback, and compensation outcomes; and
one distinguishing concurrent schedule.

If mutation re-queries or uses a broader selector, the spec must define
mutation-time membership, visible changes, affected members, and observable
outcome. "Revalidate" without a visibility schedule and outcome is incomplete.

## Acceptance evidence

Trace each acceptance assertion to the exact observation that distinguishes
the relevant counterexample. A mock call, row count, sample, green suite, or
repeated implementation assumption proves only what it observes.
