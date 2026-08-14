# Contract closure protocol

Use this protocol only when the task has a contract-bearing boundary. Its goal
is totality over reachable material behavior selected by the **Outcome lock**
and current system, not a maximal Cartesian product or every mechanism a draft
could invent.

Read `references/outcome-lock.md` before drawing nodes. Freeze its four fields;
do not copy that reference here.

## 1. Draw the closure graph

Start with the frozen **existing owner/path**: the landed owner and entry this
task will invoke. Then add task-owned nodes and directed handoffs that the
frozen owned outcome can reach. A candidate boundary belongs only when the
Outcome lock requires it as owned outcome or existing owner/path, or
current-system evidence proves a frozen owned observable is unreachable in
this task without that call. Current-system evidence cannot add an observable.

Absence of an applicable local interface is not a reason to omit the landed
owner or invent a parallel machine. Ask the human only when evidence cannot
decide whether this task should expose that entry or leave the work with a
separately owned task. Reject a more complex candidate when a grounded viable
minimal path preserves all observable behavior by using the landed owner.

Record selected nodes and handoffs:

1. input sources and entry carriers;
2. the selected existing owner/path (named owner, entry, arguments);
3. validation, proof, or normalization;
4. classifiers, factories, or state constructors;
5. public result and returned identity/data;
6. consumer, authority action, persistence, and externally visible effect;
7. retry, recovery, late-result, or competing-owner behavior only when the
   selected task-owned mechanism or selected call makes it reachable;
8. acceptance oracle and distinguishing counterexample.

Include all task-owned producers of a changed public result, not only the path
named by the task or review example. A fact arriving in a normal return, typed
error, callback, decoded object, replay, or recovery load is a separate carrier
only when that route is reachable and changes validation or preservation.

Do not add neighboring create/replace/cancel behavior, a new durable store, or
a new lifecycle as closure nodes without explicit authority for this task to
own them.

## 2. Bound the proof domain

Before using `all`, `none`, `never`, `exhaustive`, or an equivalent load-bearing
claim, decide which kind of set the mechanism must cover:

- **closed** — binding authority defines finite, enumerable membership and all
  task-owned additions pass through an owned registration or construction
  boundary;
- **self-bounded** — the upstream world may grow, but the proposed change
  constructs a restricted result, type, or projection before any governed
  consumer can observe it;
- **open-world** — new carriers, aliases, dynamic calls, serialization shapes,
  integrations, or other reachable forms can expand the set without passing a
  boundary the plan proves complete.

State why that bound holds and what evidence would falsify it. A
finite inventory of current files, tokens, call spellings, sinks, or
mechanism-authored fixtures proves an exhaustive claim only when membership
and every task-owned extension point are themselves closed. For an open-world
property, either introduce a bounded task-owned boundary or state the limits
of the selected analysis and leave uncovered material behavior unproved. Do
not mandate a parser or other technology when more than one mechanism can
establish the contract.

Keep the acceptance oracle independent of the enforcement representation: vary
a material carrier, data-flow path, or result while preserving the governing
requirement. A mechanism's own inventory repeated as its test is correlated
evidence, not proof of totality.

## 3. Identify independent axes

Derive axis values from binding evidence. Common axes include operation or
command, entrypoint/carrier, object family, resource/identity state,
provenance, result, consumer/action, and retry/recovery state.
These are prompts, not a mandatory domain model.

A language type does not by itself add an input-value closure axis. Include a
value row only when the Outcome lock or current-system evidence makes it
reachable and observable through the changed path; otherwise leave it unchanged
and unowned, not as a new oracle. A selected task-owned consumer/action call
still requires its downstream-failure row under the closure gates.

Cross two axes only when their values can vary independently and the pairing
can change a public result, rejection, state transition, ownership, persisted
identity, side effect, or oracle. Collapse equivalent rows under one stated
invariant. Do not create fictional combinations merely to fill a table.

## 4. Close every reachable material row

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

Every row must be:

- decided by binding evidence;
- explicitly rejected before an invalid result is constructed;
- left to implementation because the alternatives are behaviorally equivalent
  inside the task contract; or
- held for a named human decision, which stops authoring before save.

Silence is not a fifth state.

The selected **existing owner/path** always has a downstream-failure row. If
its ownership is genuinely undecided, ask the human; do not invent extra
identity, store, or recovery fields to make the wrong path work.

## 5. Run closure gates

Run gates only after scope provenance is established. Durable state, atomicity,
retry identity, compensation, and recovery are obligations when a selected
task-owned mechanism or selected existing owner/path makes them necessary—not
because a more complex draft could have used them.

- **Totality:** every reachable material row has one disposition.
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
- **Proof-domain adequacy:** every load-bearing universal or negative claim has
  a justified closed or self-bounded domain, or remains explicitly unproved;
  reading all current artifacts does not close an open-world property.

If a new rule narrows a valid-state set, rebuild every producer and consumer
that can reach that set before accepting the rule. A producer may not emit a
state that its factory or consumer rejects.

## 6. Keep a private closure receipt

Before drafting, record the frozen existing owner/path, axes considered,
collapsed equivalence rules, rejected rows, producer/consumer traces, required
state/identity continuity, downstream-failure behavior, proof-domain bound,
and acceptance oracles. The receipt is reasoning scaffolding, not a required
fifth artifact. Put only the canonical contracts and useful tables in the
four-file cluster.
