# Contract closure protocol

Use this protocol only when the task has a contract-bearing boundary. Its goal
is totality over reachable material behavior, not a maximal Cartesian product.

## 1. Draw the closure graph

Record the task-owned nodes and directed handoffs:

1. input sources and entry carriers;
2. validation, proof, or normalization;
3. classifiers, factories, or state constructors;
4. public result and returned identity/data;
5. consumer, authority action, persistence, and externally visible effect;
6. retry, recovery, late-result, or competing-owner behavior when reachable;
7. acceptance oracle and distinguishing counterexample.

Include all task-owned producers of a changed public result, not only the path
named by the task or review example. A fact arriving in a normal return, typed
error, callback, decoded object, replay, or recovery load is a separate carrier
only when that route is reachable and changes validation or preservation.

## 2. Identify independent axes

Derive axis values from binding evidence. Common axes include operation or
command, entrypoint/carrier, object family, resource/identity state,
provenance, classification/outcome, consumer/action, and retry/recovery state.
These are prompts, not a mandatory domain model.

Cross two axes only when their values can vary independently and the pairing
can change a public result, rejection, state transition, ownership, persisted
identity, side effect, or oracle. Collapse equivalent rows under one stated
invariant. Do not create fictional combinations merely to fill a table.

## 3. Close every reachable material row

For each row, establish:

| Field | Required answer |
| --- | --- |
| Preconditions | Exact reachable input, carrier, state, and proof assumptions |
| Public behavior | Returned type/value/state or exact rejection boundary |
| Identity/data | What is preserved, transformed, discarded, or persisted |
| Consumer | Which consumer/action accepts the result and with what arguments |
| Effect | Terminal/nonterminal meaning, ownership, side effects, retry/recovery |
| Downstream failure | Outward error/result, attempts, retry/compensation, partial-effect owner, and reuse/replay meaning |
| Oracle | A check that proves this row and rejects its nearest unsafe alternative |

Each row must be one of:

- **specified** by binding evidence;
- **explicitly rejected** before an invalid result is constructed;
- **implementation freedom** because alternatives are behaviorally equivalent
  inside the task contract; or
- **blocked** by a named material decision, which stops authoring before save.

Silence is not a fifth state.

## 4. Run closure gates

- **Totality:** every reachable material row has one status.
- **Constructibility:** every emitted public result satisfies its own factory or
  value-object invariant.
- **Consumability:** the selected consumer accepts the exact result, identity,
  state, and arguments.
- **Continuity:** identity, provenance, ownership, and durable authority survive
  every boundary for as long as the task requires, including process loss when
  recovery is in scope.
- **Carrier parity:** sibling carriers that reveal the same authoritative fact
  preserve it or intentionally reject it under the same governing rule.
- **Transition safety:** terminal, nonterminal, retry, recovery, and side-effect
  meanings do not contradict one another.
- **Downstream failure:** for every selected consumer/action call that can fail,
  define whether the same error is propagated, mapped, or suppressed; the
  number of attempts; retry/compensation behavior; ownership of any partial
  effect; and whether the same command/result can be invoked again. When the
  binding scope forbids error handling, retry, and orchestration and repository
  evidence supplies no different policy, transparent unchanged propagation,
  one attempt, and no internal compensation are the derived technical
  consequence—not an invitation to invent a new error policy.
- **Oracle adequacy:** each high-consequence rule has a positive case and a
  counterexample that changes one material variable.

If a new rule narrows a valid-state set, rebuild every producer and consumer
that can reach that set before accepting the rule. A producer may not emit a
state that its factory or consumer rejects.

## 5. Keep a private closure receipt

Before drafting, record the axes considered, collapsed equivalence rules,
rejected rows, producer/consumer traces, required state/identity continuity,
downstream-failure behavior, and acceptance oracles. The receipt is reasoning
scaffolding, not a required fifth artifact. Put only the canonical contracts
and useful tables in the four-file cluster.
