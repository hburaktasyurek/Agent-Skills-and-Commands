---
name: spec-readiness
description: "Check whether a named implementation specification is ready to hand to an implementer without forcing them to invent structural contracts. Use explicitly before implementation handoff to return READY or root-complete NOT READY blockers. Do not use as a runtime correctness or PR merge review."
---

# Spec Readiness

Review the current spec from the implementer's chair:

> If implementation started tomorrow, where would the implementer have to
> choose a contract the spec should already have chosen?

Review artifacts, not the author. Read only; do not edit the spec or code.

**Output discipline — critical:** do all investigation through tools and private
reasoning. The only natural-language response is the completed verdict report:
its first byte is `READY` or `NOT READY`, immediately followed by the required
fields. Never emit progress, intent, scope, method, approval, or a future-tense
note before that verdict.

## Structural threshold

A missing choice is a Blocker only when different answers change a declared
work package, consumer, or observable contract through data, control,
identity, ownership, authority, persisted state, lifecycle, compatibility,
recovery, side effects, or acceptance behavior.

A choice is implementation freedom when alternatives remain inside one
component and preserve every boundary and observable obligation. Private
algorithms, helper names, local refactors, and hypothetical consumers are not
Blockers unless the binding artifacts make them load-bearing.

State activation or rollout timing only when a binding artifact defines it. Do
not infer that activation is immediate merely because a code change would be
deployed.

## Scope provenance and necessity

Derive the Outcome lock independently from the spec: binding outcome, scope,
non-goals, sibling owners, acceptance, and stop conditions. A proposed
mechanism does not become task-owned merely because the spec depends on it.
For every Blocker, put one classification inside **Root and closure**:

- `necessity=outcome-required` when removing the mechanism makes the binding
  outcome unsafe or unreachable; retain its full producer-consumer closure.
- `necessity=architecture-induced` when removal eliminates a mechanism
  unsupported by the Outcome lock; the closure is removal/simplification, not
  fuller internal design.
- `necessity=mixed` only when the finding identifies both a concrete
  outcome-required obligation and separable optional manifestations; state both
  in the same root. Do not use `mixed` merely because several designs could
  meet an outcome-required contract.

Classify the missing **observable obligation**, not merely the proposed
mechanism that currently prevents it. If the binding outcome requires an
action, path, or fail-closed boundary to remain reachable, a construction or
dependency coupling that makes it unreachable is
`necessity=outcome-required`: its repair may remove or simplify the coupling,
but the reachability closure remains required. Use
`architecture-induced` only if removing the whole mechanism family leaves
every Outcome-lock obligation already satisfied.

Use stable root `OPTIONAL_MECHANISM_SCOPE_AMPLIFICATION` when one
architecture-induced family adds mechanisms unsupported by the Outcome lock.

An unresolved K2 is an authority Blocker. Do not convert it into
reviewer-selected architecture.

## Review basis

1. Resolve and reread the exact current spec and directly binding artifacts.
   Record paths and content/revision identity. For Git artifacts, distinguish
   staged and worktree content when they differ. If Git identity inspection is
   unavailable, record that limitation after one attempt; do not retry
   equivalent commands.
2. Derive the binding task contract independently of the spec: authority,
   Outcome lock, acceptance/stop conditions, ordered work packages, and
   relevant migration, rollback, recovery, or activation state. Do not narrate
   it as a separate report field.
3. Use `full` mode by default. For re-review mode selection, shared cycle
   semantics, and incremental procedure, follow
   [references/incremental-review.md](references/incremental-review.md).

If no identifiable current spec exists, return `NOT READY` with the missing
basis and stop. Do not reconstruct a spec from guesses.

## Review cycle

Shared cycle semantics live in
[references/incremental-review.md](references/incremental-review.md). On a
full review, finish every applicable node, edge, ledger row, acceptance path,
and triggered reverse path before reporting. A first Blocker is not a reason
to stop: return every distinct, currently detectable Blocker family in one
batch.

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

Then one Basis line:

```text
Basis: <full | incremental | reset-to-full>; <1/3 | 2/3 | 3/3>; <paths and exact content/revision identity or limitation>
```

Do not emit separate `Review mode`, `Review cycle`, `Artifact basis`,
`Consequence posture`, or `Task contract` headers. Do not write a Coverage
receipt. Reports do not restate task, method, or prior narrative.

The response itself is the completed verdict report. Do not preface it with a
private ledger, review plan, scope narrative, approval condition, or execution
note. Start with the verdict and stop after its required fields; do not leave
private analysis or a report outline as the final deliverable.

`READY` is not a bare verdict. After Basis, include one concise `Ready
evidence:` line that identifies the named contract/consumer coverage,
implementation freedom where relevant, and why untriggered structural gates
do not add an obligation. At cycle `3/3` with `NOT READY`, emit the actual
three-field Blocker(s) and full Workflow stop below, never a plan to emit them.

On re-review, before current findings, emit only concise decision-relevant
Prior lines:

```text
Prior: <id> resolved | still present | superseded — <current-spec evidence that decides the status>
```

For each finding use the shared three-field compact form:

```text
[Blocker | Gap | Note] <title>
Evidence and impact: <current path:line/section or inline clause; activated harm / structural divergence and recoverability>
Root and closure: <stable id; necessity=outcome-required | architecture-induced | mixed; other manifestations; producers, consumers, states, and proofs revise must close; falsifiable decision without prescribing excess mechanism>
Proof: <independent evidence / distinguishing counterexamples>
```

Every Blocker field above is required. On an incremental review, add
`Classification: incomplete closure | prior-review gap | revision-induced`.
For a repeated root id in `Root and closure`, also add `Repeat diagnosis:
incomplete revision | prior root diagnosis incorrect` with evidence. A Gap is
bounded local ambiguity or weak evidence that may cause rework but does not
force a structural boundary choice. A Note is minor clarity loss with an
obvious local resolution. Combine fields on Gaps and Notes when doing so loses
no decision-relevant information.

Do not require Task contract, Coverage receipt, Checked and solid, or
Consequence posture narration.

On cycles `1/3` and `2/3`, close with:

```text
Next: revise-spec-from-review | implementation
```

When cycle `3/3` is `NOT READY`, after the Basis line and any Prior lines,
list only the current three-field Blocker(s), then end with Workflow stop. Do
not emit Consequence posture, Task contract, Coverage receipt, or Checked and
solid, and do not repeat any expanded finding form:

```text
Workflow stop
Problem: <one plain-language sentence naming the unresolved root>
Why it is still open: <one plain-language sentence>
Required closure: <the evidence-backed in-scope result that must hold>
Choices:
1. Confirm the required closure — <what it preserves>
2. Provide binding evidence that another in-scope closure preserves every stated acceptance condition — <what it must prove>
[3. Stop this task — <the requested outcome will not be delivered>]
Recommendation: <evidence-backed choice, or "Need your decision" when binding authority is missing>
```

Use two or three concrete, plain-language choices. They must arise from the
remaining root and preserve the binding task outcome. Offer a different
behavior only when binding authority leaves that in-scope choice open. When
the evidence admits only one closure, option 2 is evidence that it is already
met, not authority to weaken it. Otherwise use confirmation of the required
closure, missing binding authority, or stopping the task. Never present
weakened acceptance, a changed product outcome, or deferral to another work
package as a way to obtain READY.

Do not prescribe architecture when several contracts satisfy the outcome.
Route plan correctness to `adversarial-spec-review` and runtime/PR correctness
to the corresponding review skill.
