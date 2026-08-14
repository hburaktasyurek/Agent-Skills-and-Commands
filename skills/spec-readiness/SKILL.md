---
name: spec-readiness
description: "Check whether a named implementation specification is ready to hand to an implementer without forcing them to invent structural contracts. Use explicitly before implementation handoff to return READY or root-complete NOT READY blockers. Do not use as a runtime correctness or PR merge review."
---

# Spec Readiness

Review the current spec from the implementer's chair:

> If implementation started tomorrow, where would the implementer have to
> choose a contract the spec should already have chosen?

When the invocation includes `Adapter: codex-task-to-spec`, verify the named
packet manifest and hashes, read the frozen lock and seed inventory whole, and
read every JSON in a non-`none` `Authority resolutions:` manifest. Review only
the supplied detached commit. Parent prose and conversation memory are not
authority. Use full mode and keep the detached worktree read-only.

If that adapter invocation has `Stage: resolution-check`, the normal verdict
format is suspended. Read the named question-resolution artifact and return
only:

```text
Resolved: yes | no
Lock: changed | unchanged
Resume: task-groundwork | to-spec | commit | review-stage
Basis: <absolute question-resolution artifact path> | sha256:<hash>
```

Verify the resolution JSON's source role/stage/mutation and `calling_phase`.
A changed lock returns `task-groundwork`. With an unchanged lock, return
`review-stage` only when the existing spec bytes remain valid under the answer;
an in-lock spec change returns `to-spec`.

Stop after this resolution result; every remaining verdict and report rule is
inapplicable to that invocation.

Review artifacts, not the author. Do not edit the spec or code. Write a
report file only when the invocation includes `Write report under:`; then
write `YYYY-MM-DD-HHMM-spec-readiness.md` under that directory (local clock).
If that exact name exists, append the lowest available `-2`, `-3`, and so on.
Finish the report, write those same bytes, then emit the same bytes in chat.
Do not append a paste card to the report. With no `Write report under:` field,
chat only — do not create or modify files. Do not guess a write path from the
spec folder. If the invocation has `Lock:`, read that file whole as the frozen
lock; do not substitute a chat summary.

Do all investigation through tools and private reasoning. Return only the
completed report: its first line is `READY` or `NOT READY`, and its next
non-empty line is `Basis:`. Do not add a title, progress narration, wrapper,
approval step, or emit-later outline. If the host stores the answer in an
artifact, that artifact contains the same completed report.

Read `references/outcome-lock.md` and **score** the spec against that boundary.
Do not copy the reference into the report. Use a landed owner/path when it
already owns the needed result; owning a parallel machine inside this task is
not closure.

## Convergence law — overrides every later instruction

1. Establish a Blocker only when current evidence proves that implementation
   must choose a binding structural contract the spec should own and that
   different choices change a declared work package, consumer, or observable.
2. A prior root, review history, review mode, or repeated root does not create
   a Blocker.
3. Complete the bounded ledger, dependency, acceptance, and reverse-path review
   below. If it establishes zero current Blockers, return READY immediately.
4. Apply no numeric review-round or rewrite limit. Remain NOT READY only while
   current evidence proves at least one Blocker.
5. Ask a question only when missing or contradictory binding authority requires
   a human choice. Never pause because a prior review failed or a root repeated.

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

## Frozen boundary

Freeze the Outcome lock from the catalog, decisions, groundwork brief, or an
explicit human lock. The spec's own Outcome lock section is drift evidence,
not new authority. Stay inside the frozen boundary; do not invent adjacent
product requirements.

Live code may show whether the frozen outcome is decided, which landed owner or
neighbor currently owns a behavior, and what this spec changes. It cannot
enlarge the task merely because a serious failure exists nearby.

For every Blocker, **Root and closure** must say why the missing contract
belongs to this task. If removing unsupported child-owned machinery removes the
problem, require removal or a human decision—not completion of that machinery.
If the frozen outcome still requires part of the behavior, separate and close
only that part. Name any existing owner/path in plain prose. Missing or
contradictory task authority becomes a question for the human, never a stronger
reviewer interpretation.

Return `Next: to-spec` only when the closure stays inside the frozen owned
outcome or existing owner/path. A neighbor outcome, new durable owner, or lock
enlargement requires one `Question:` and `Next: wait for answer`.

## Review basis

1. Resolve and reread the exact current spec and directly binding artifacts.
   Record paths and content/revision identity. For Git artifacts, distinguish
   staged and worktree content when they differ. If Git identity inspection is
   unavailable, record that limitation after one attempt; do not retry
   equivalent commands.
2. Consume the frozen Outcome lock, acceptance/stop conditions,
   ordered work packages, and relevant migration, rollback, recovery, or
   activation state. When the invocation has `Lock:`, read that file whole as
   the frozen lock. Do not narrate it as a separate report field.
3. Use `full` mode by default. For re-review mode selection, convergence, and
   incremental procedure, follow
   [references/incremental-review.md](references/incremental-review.md).

If no identifiable current spec exists, return `NOT READY` with the missing
basis and stop. Do not reconstruct a spec from guesses.

For a normal `codex-task-to-spec` review, use this exact machine identity in
the existing Basis line:

```text
Basis: full; commit-sha=<detached full Git SHA>; packet-sha256=<manifest SHA-256>; <paths and reviewer-owned basis detail>
```

Open a repository path absent from the seed inventory only when it is a direct
load-bearing dependency needed to decide a current ledger or acceptance claim.
Do not perform an open-ended repository scan. For each such path, record its
repository-relative path, full Git blob hash at the review commit, and reason
as an `Evidence addition:` line in the report.

## Review completeness

On every review, finish every applicable node, edge, ledger row, acceptance
path, and triggered reverse path before reporting. A first Blocker is not a
reason to stop: return every distinct, currently detectable Blocker family in
one batch.

## Contract ledger

Create a private node for every independently owned work package and a directed
edge for every producer-consumer or authority handoff. Check these rows for
every applicable node and edge:

| Row | Required contract |
|---|---|
| Owner and outcome | Entry point, owner, dependencies, construction, transaction/lifecycle owner, promised outcome |
| Inputs and authority | Shapes, preconditions, context, canonical source when inputs or facts disagree |
| Public contract and identity | Cross-task types, creation authority, states, payloads, equality and identity meaning |
| Outcomes | Success, no-op, replay, denial, conflict, missing/malformed data, failure, rollback, retry and exhaustion |
| State and effects | Pre/post state, exact records, persistence, side effects, ordering, compatibility, activation and recovery |
| Proof | Acceptance criterion, observation point, distinguishing counterexample and test oracle |

For each applicable row decide privately whether the artifacts choose a
coherent contract, the remaining choices are behaviorally equivalent local
freedom, an unknown is explicitly owned and bounded, or implementation would
have to choose a missing boundary contract. Only the last case is a Blocker.
Do not emit these as status labels.

Do not treat a whole node as complete because an endpoint or happy path is
named. An existing owner/path is sufficient when its owner, entry, and
observable failure path are named; this task need not specify that owner's
internal machine.

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
Basis: <full | incremental | reset-to-full>; <paths and exact content/revision identity or limitation>
```

Report only the fields defined below. Do not restate the task, review method,
coverage process, or prior narrative.

`READY` is not a bare verdict. After Basis, include one concise `Ready
evidence:` line that identifies the named contract/consumer coverage, material
implementation freedom where relevant, the existing owner/path, and why
untriggered structural gates do not add an obligation.

On re-review, before current findings, emit only concise decision-relevant
Prior lines:

```text
Prior: <id> resolved | still present | superseded — <current-spec evidence that decides the status>
```

In Codex adapter mode, add one line for every direct path opened beyond the
seed inventory:

```text
Evidence addition: <repository-relative path> | <full Git blob hash> | <reason>
```

Keep path and reason on one line and do not include the literal delimiter
` | ` inside either value.

Report only current Blockers, using this compact form:

```text
[Blocker] <title>
Evidence and impact: <current path:line/section or inline clause; activated harm / structural divergence and recoverability>
Root and closure: <stable descriptive root; why it belongs to this task; existing owner/path when applicable; other manifestations; producers, consumers, states, and proofs the next to-spec rewrite must close; falsifiable decision without prescribing excess mechanism>
Proof: <independent evidence / distinguishing counterexamples>
```

Every Blocker field above is required. On re-review, put the concise origin or
repeat explanation in `Root and closure`: say whether the prior root remains,
the prior review missed evidence already in its basis, or the rewrite made the
root reachable. Non-blocking local ambiguity, weak evidence, and minor clarity
loss do not belong in this readiness report.

On in-lock NOT READY, close with:

```text
Next: to-spec
```

On READY, close with:

```text
Next: review-stage gate
```

Unsupported child-owned architecture is an in-lock Blocker when the frozen lock
already decides removal or use of a landed owner/path; close it with `Next:
to-spec`. When binding authority is missing or contradictory and leaves a real
architecture, scope, durable-store, or create/replace/cancel choice open, do
not send `to-spec`. After the current Blocker(s), end with one concrete
plain-language `Question:` and `Next: wait for answer`. Explain the
evidence-backed choices and consequences without a fixed menu. Never turn a
repeated root, incomplete correction, or prior NOT READY into an authority
question.

Do not prescribe architecture when several contracts satisfy the outcome.
Route plan correctness to `adversarial-spec-review` and runtime/PR correctness
to the corresponding review skill.
