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
reasoning. Emit **zero** natural-language assistant text until the verdict
report is complete. The deliverable's first non-whitespace character must begin
the bare first line `READY` or `NOT READY`; the next non-empty line is
`Basis:`. Forbidden before that verdict line (including as a wrapper around a
correct report): markdown titles such as `# Spec Readiness Verdict`, approval
or “on confirmation re-emit” wrappers, outer ` ```text ` fences, `I'll`,
`Checking`, progress narration, or any preface that is not the report itself.
If the host stores the answer in a plan/card, that stored body is still the
report — not a ledger or emit-later outline. If tool use produced chatter,
discard it and return only the report.

Read `references/outcome-lock.md` and **score** the spec against its four lanes.
Do not copy that essay into the report. A review closes only by calling a
landed substrate or escalating the gap to its owner. Owning a parallel
machine inside the child is not closure. That call is not lock enlargement.

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

## Frozen lock and necessity

The Outcome lock is frozen from the catalog, decisions, groundwork brief, or
an explicit human lock: the four lanes. The spec's own Outcome lock section is
drift evidence, not new authority. An unclear lock is K2, not a stronger
reviewer reading. Stay inside that lock; do not invent adjacent product
requirements. A reviewer's `necessity=` stamp is not lock authority.

Live code answers at most **Q-task** (is a frozen owned observable decided?),
**Q-live** (is the neighbor a substrate-call, sibling-fence, or residual — not
P0/P1 alone), and **Q-delta** (did this spec newly swallow a sibling outcome,
newly break a required substrate-call, or newly own a parallel machine?).

For every P0/P1 or Blocker, classify necessity inside **Root and closure** as
exactly one:

- `necessity=outcome-required` — removing the mechanism makes a frozen owned
  observable unsafe or unreachable; retain full consequence closure.
- `necessity=architecture-induced` — the spec **owns** a parallel machine;
  removing that ownership makes the failure disappear. Binding to / calling
  the landed owner is not this. Require removal/simplification, not
  completion of the parallel machine.
- `necessity=mixed` — separate the outcome-required obligation from optional
  manifestations and close only the former.

When the child binds to a landed owner, name that owner as `reused=<owner>`
in Root and closure. That is not architecture-induced and not a patch
instruction.

Score `necessity=` against the frozen lock. This child **owning**
create/replace/cancel, a new transaction/publication/recovery protocol, or a
fenced sibling's product is `architecture-induced` or K2, not
`outcome-required`. Entering a landed owner's existing entry is substrate-call.
An insufficient product lock is K2 or Workflow stop, not a larger lock.

Use stable root `OPTIONAL_MECHANISM_SCOPE_AMPLIFICATION` when an
architecture-induced family adds a parallel machine unsupported by the
Outcome lock.

An unresolved K2 is an authority blocker, never reviewer-selected architecture.

## Review basis

1. Resolve and reread the exact current spec and directly binding artifacts.
   Record paths and content/revision identity. For Git artifacts, distinguish
   staged and worktree content when they differ. If Git identity inspection is
   unavailable, record that limitation after one attempt; do not retry
   equivalent commands.
2. Consume the frozen Outcome lock four lanes, acceptance/stop conditions,
   ordered work packages, and relevant migration, rollback, recovery, or
   activation state. Do not narrate it as a separate report field.
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
| Owner and outcome | Entry point, owner, dependencies, construction, transaction/lifecycle owner, promised outcome |
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
named. A selected substrate-call is SPECIFIED when the owner, entry, and
failure path are named; it is not MISSING because this child does not own
that machine.

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

Open at character zero of the visible deliverable with exactly `READY` or
`NOT READY` on its own first line. `READY` requires zero Blockers and only
explicitly owned, bounded known unknowns. Never use "ready with caveats."
Do not wrap the report in a title, approval card, or outer code fence.

Then one Basis line (example shape; use `READY` when that is the truth):

```text
NOT READY
Basis: <full | incremental | reset-to-full>; <first | rewrite-1 | stop>; <paths and exact content/revision identity or limitation>
```

Do not emit separate `Review mode`, `Review cycle`, `Artifact basis`,
`Consequence posture`, or `Task contract` headers. Do not write a Coverage
receipt. Reports do not restate task, method, or prior narrative.

The response itself is the completed verdict report. Delete any preface
(`# Spec Readiness Verdict`, “on confirmation”, ledger, plan, or execution
note). Start with the verdict line and stop after the required fields.

If the host forces a plan/card artifact, that artifact's body must still be
the completed report: its first non-whitespace characters are `READY` or
`NOT READY`, then `Basis:`, then the required fields. Incomplete (replace
before returning — do not ask for confirmation):

- ends with “On confirmation”, “Emit only”, or “emit the report” without the
  report body already present after that instruction
- is only Inputs / Mode and cycle / Outcome lock / Prior disposition / Verdict
  notes with no following bare `NOT READY`/`READY` + `Basis:` report
- at `stop` `NOT READY`, omits the literal `Workflow stop` block below

`READY` is not a bare verdict. After Basis, include one concise `Ready
evidence:` line that identifies the named contract/consumer coverage,
implementation freedom where relevant, the substrate-call that is in-lock,
and why untriggered structural gates do not add an obligation. At cycle
`stop` with `NOT READY`, the deliverable must already contain the three-field
Blocker(s) and the full `Workflow stop` block below. A memo that only plans
to emit them is not a report.

On re-review, before current findings, emit only concise decision-relevant
Prior lines:

```text
Prior: <id> resolved | still present | superseded — <current-spec evidence that decides the status>
```

For each finding use the shared three-field compact form:

```text
[Blocker | Gap | Note] <title>
Evidence and impact: <current path:line/section or inline clause; activated harm / structural divergence and recoverability>
Root and closure: <stable id; necessity=outcome-required | architecture-induced | mixed; reused=<owner> when scoring a substrate-call; other manifestations; producers, consumers, states, and proofs the next to-spec rewrite must close; falsifiable decision without prescribing excess mechanism>
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

On `first` NOT READY that is in-lock, close with:

```text
Next: to-spec
```

On READY, close with:

```text
Next: implementation
```

On `first` NOT READY that is architecture-induced, lock enlargement, a new
durable store, or a create/replace/cancel *request*, do not send `to-spec`.
Emit Workflow stop with the typed K2 enum as Choices. Never present owning
the parallel machine as the path to READY.

When cycle `stop` is `NOT READY`, after the Basis line and any Prior lines,
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

Use two or three concrete, plain-language choices from the remaining in-lock
root. In-lock roots preserve the binding task outcome. Offer a different
behavior only when binding authority leaves that in-scope choice open. When
only one in-lock closure exists, option 2 is evidence it is already met. Never
present weakened acceptance or deferral as a way to obtain READY.
Lock-enlarging or parallel-machine roots replace those choices with the typed
K2 enum: `call-substrate`, `own-in-child`, `defer-new-child`, `stop` — never
confirm the inflated closure.

`rewrite-1` NOT READY uses this same terminal form with cycle `stop`.

Do not prescribe architecture when several contracts satisfy the outcome.
Route plan correctness to `adversarial-spec-review` and runtime/PR correctness
to the corresponding review skill.
