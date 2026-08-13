---
name: to-spec
description: "Produce an evidence-backed four-file implementation spec for one bounded software change, using consequence-calibrated contract closure so reachable behavior is decided without over-specifying local work. Use when a grounded task must become an implementation handoff. Triggers: to-spec; write the spec; hand this off."
---

# to-spec

## Purpose

Turn one grounded software task into a production-ready specification that an
implementation agent can execute without inventing a structural contract.

The finish condition is not merely four files. The cluster must be complete for
the task's reachable consequences, internally consistent, proportionate to the
change, and independently verifiable.

This skill is the only spec-byte author. Parent, review, and ad-hoc
hole-closing do not write spec files.

Read `references/outcome-lock.md` and **freeze** its four lanes. Do not copy that
essay into the spec.

## Inputs and authority

Use the complete conversation, `task-groundwork` result or equivalent grounded
frame, and authoritative task artifacts. Require one bounded outcome, explicit
scope/non-goals, acceptance or stop conditions, and an unambiguous output root.
Do not restart groundwork when those are already present.

Resolve premise types with the source that owns them:

- intended behavior: latest explicit user decision, then the most specific
  binding task/acceptance contract;
- current behavior: live code, schema, configuration, tests, and call paths;
- external behavior: version-relevant primary documentation;
- conventions: repository instructions and repeated current patterns.

History, names, comments, and analogous code are supporting evidence, not
authority. When sources conflict, expose the conflict rather than silently
choosing one. A reviewer's `necessity=` stamp is not lock authority.

Validate a grounding handoff; do not trust its readiness label. Freeze the
**Outcome lock** four lanes—owned outcome, substrate-call, sibling-fence,
accepted residual—and check any `Open K2` yourself. Resolve remaining K0
evidence questions, or use the existing material/non-material gap rule;
preserve K1 as bounded implementation freedom. If any K2 remains, or an
adjacent/future-owned concern was promoted without binding authority, stop
without saving a spec.

When stopping, name the one real scenario, why the choice changes observable
behavior, and ask exactly one question whose options are only
`call-substrate` / `own-in-child` / `defer-new-child` / `stop`. Fill each
option with the concrete binding for this scenario. Do not offer a free-form
menu. Do not return ordinary technical consequences to the human when binding
rules and repository evidence already determine them.

## Consequence calibration

Calibrate from the worst credible consequence reachable through the change,
not the task label, diff size, author confidence, or apparent simplicity.

- **Focused:** one local presentation or implementation detail with no changed
  public contract, durable state, authority, external effect, or multi-component
  handoff. Trace its direct input → output → observer. Normally use one compact
  acceptance group and one implementation task; never create a no-change or
  audit-only task merely to make the plan look decomposed.
- **Contract-bearing:** any public interface, independent input families,
  producer/consumer handoff, identity or provenance rule, durable state,
  permission, money, personal data, external provider, retry, recovery,
  concurrency, or irreversible effect.

For a contract-bearing task, read
[`references/contract-closure.md`](references/contract-closure.md) completely
and apply it before writing prose. For a focused task, do not invent unrelated
matrices, threat models, systems, or infrastructure. In a mixed task, spend the
extra depth only on the contract-bearing boundary.

## Procedure

### 1. Freeze the task contract

Record privately:

- controlling request and authority source;
- frozen Outcome lock four lanes: owned outcome, substrate-call (named landed
  owner and entry), sibling-fence, accepted residual;
- resolved K0 evidence, K1 implementation freedoms, and any Open K2;
- exact spec root—`agent-os/specs` by default, or the approved alternative—and
  a clear timestamped slug.

Do not save a partial cluster while an Open K2 or promoted adjacent concern
remains. Ask the typed enum; do not write spec bytes to paper over it.

### 2. Inspect enough evidence

Inspect the relevant production code, tests, schema, configuration, history,
repository instructions, and inventory before stating current facts. Cite
file-backed claims with verified paths and exact line ranges. Attribute
conversation decisions without fabricated file citations. Support absence or
uniqueness claims with a search across plausible owners.

Label a non-decision evidence gap as `⚠️ UNVERIFIED` everywhere it affects the
cluster. A material decision may not be hidden under that label.

### 3. Substrate-call, then close behavior

Before closure, quote the frozen four lanes. Classify every proposed major
behavior with the lock discriminator: already bound to the landed machine, or
a neighbor's product pulled forward.

A public interface, persistent state, transaction/recovery protocol,
idempotency identity, provider operation, cross-component identity, or
lifecycle branch needs outcome-lock authority as **owned outcome** or
**substrate-call**. Current-system evidence may prove a frozen owned
observable is unreachable in this child without that call; it cannot add an
observable. Local mechanism ownership does not authorize swallowing a
sibling's create/replace/cancel, a new framework, or sibling work.

**Substrate-call first.** Prefer entering the named landed owner. Absence of
an applicable local interface is not a ban; it is Open K2 `call-substrate` or
`defer-new-child`. Do not invent a parallel machine because the front door
was not imported yet.

Compare every grounded viable minimal path. Choose the safe route that calls
landed owners and adds the fewest task-owned states and boundaries. If no
safe bounded route exists, stop without saving and ask the typed enum; never
silently select a framework.

Once a **call** is selected, its observable failure path remains mandatory.
If the selection is wrong, stop and ask; do not invent extra identities,
stores, or recovery rows to make the wrong call work.

A typed input's full representable range is not authority to add normative
branches or acceptance tests. Specify only values that the Outcome lock or
current-system evidence places on the changed path; leave other input behavior
unchanged and unowned.

For focused work, prove the direct changed path, its observable result, and one
counterexample when exactness matters.

For contract-bearing work, build the closure model required by
`references/contract-closure.md`. Decide, reject, or deliberately leave as
bounded implementation freedom every reachable **task-owned** material row. If
a row changes product behavior and no authority selects it, stop before
drafting.

Do not confuse a clean name, plausible API, happy-path test, or green suite
with contract closure. Verify that every selected public producer result is
constructible, accepted by its consumer, preserves required identity/state, and
has an oracle that can distinguish the unsafe alternative. Treat downstream
consumer failure as a separate row whenever the selected call can reject,
throw, or partially apply an effect.

### 4. Draft exactly four files

Create one folder at
`<recorded-spec-root>/YYYY-MM-DD-HHMM-<slug>/`, where the recorded root defaults
to `agent-os/specs` only when no alternative was approved. The folder contains
exactly:

- `shape.md`: what this builds, verified key interfaces, data/control flow,
  canonical decisions and invariants, and product-focused out of scope;
- `plan.md`: observable acceptance criteria mapped to named `shape.md` and
  `standards.md` sections; ordered implementation tasks; dependencies; risks;
- `references.md`: sources actually examined, exact supporting facts,
  decisions, discrepancies, evidence limits, link audit, and exact unverified
  count;
- `standards.md`: only source-backed naming, structure, anti-pattern, test, and
  acceptance-critical assertion rules relevant to this task.

Each implementation task names owner, files/change, validation, dependencies,
and independently reviewable outcome. Order tasks by executable dependency and
identify the first integration slice. Decomposition organizes the plan; it does
not substitute for behavioral closure.

Keep the cluster proportional. A one-literal local change still gets four
files, but they should each be short: target no more than about 800 words across
the cluster unless a task-owned discrepancy or validation detail makes the
extra text necessary. Coalesce criteria that share one observable contract.
For focused work, `references.md` needs only the controlling sources, material
decision/discrepancy, evidence limit, link result, and unverified count; omit
routine command narration and history that do not change the handoff. Do not
repeat the same rule in several long forms, reproduce skill instructions,
narrate the investigation, or add gates for excluded systems merely to make
the spec look rigorous.

### 5. Validate the final cluster

Before saving, draft all four files and then audit the cluster as one artifact:

1. Every normative rule has one canonical home and no conflicting paraphrase.
2. Every changed boundary traces from producer/input through public result and
   consumer success/failure to state/effect; reverse-trace each acceptance
   oracle to that path.
3. Every quantified criterion (`every`, `only`, `exactly`) is proved over its
   full stated set, not representative examples. For a load-bearing universal
   or negative claim, identify whether that set is closed, self-bounded, or
   open-world under `references/contract-closure.md`; a finite current
   inventory cannot silently stand in for an open-world proof.
4. A counterexample changes one material variable and fails for the intended
   reason when exact type, value, state, ownership, or side effect matters.
   Keep it independent of the enforcement representation when correlated
   fixtures could repeat the same false premise.
5. Every implementation task can start without choosing a missing structural
   contract; non-material freedom remains visibly non-canonical.
6. Scope, interfaces, matrices/tables when used, examples, tests, tasks, and
   out-of-scope clauses agree.
7. Every emitted relative path and Markdown heading link resolves in the saved
   cluster.

Reread all four final files after the latest edit. If the audit exposes a new
decision or contradiction, repair it or stop before saving; do not leave a
known hole for review to rediscover.

Validation must state what each check proves and does not prove. Do not claim
future implementation tests ran. Avoid brittle byte-level or shell gates that
the task does not require.

### 6. Save, report, and stop

Return the folder path, a one-line summary of each file, the exact
`⚠️ UNVERIFIED` count, and confirmation that no implementation was performed.
Stop after the specification. Do not independently review it, implement it,
change workflow documentation, mutate Git, open a PR, install, or merge.

On an in-lock rewrite after a `first` FAIL, replace the cluster in place as
the same spec identity; do not open a parallel spec folder.

## Boundaries

- Do not change the task contract to make specification or validation easier.
- Do not silently select material product behavior or architecture.
- Do not swallow a sibling outcome or invent a parallel machine because a
  review stamped `necessity=outcome-required`.
- Do not force a full cross-product where variables cannot vary independently
  or do not change behavior.
- Do not treat later `adversarial-spec-review` or `spec-readiness` as a reason
  to defer a hole already visible during authoring.
- Human approval is required before changing the spec root, deferring a
  material decision, expanding scope, accepting a materially weaker validation
  route, implementing, committing, pushing, installing, or merging.
