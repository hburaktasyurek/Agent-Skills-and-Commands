---
name: revise-spec-from-review
description: Reconcile findings supplied by a separate, independent review session into an existing spec folder without performing a new review. Independently verify each finding and the reviewer's proposed remedy against current repository evidence; apply only confirmed, in-scope, surgical spec edits; push back on false, stale, or scope-expanding findings; and stop for genuine product or scope decisions. Use when the user pastes adversarial-spec-review or spec-readiness findings and asks to revise, update, or fix the spec. Never implement the spec, edit outside the named spec folder without permission, commit, or push.
---

# revise-spec-from-review

Revise a spec in its authoring/editing session from findings produced in a separate review session. Act as a skeptical reconciler and editor, not as another reviewer and not as an implementer.

## Position in the pipeline

The intended loop is:

1. A spec-authoring session runs `task-groundwork`, then `to-spec`.
2. A separate session, independent of the authoring conversation, runs `adversarial-spec-review` and/or `spec-readiness`.
3. The spec-authoring/editing session runs this skill with those supplied findings and the exact spec folder.
4. A separate review session independently reviews the revised spec again.

The labels or session numbers do not matter; separate conversational contexts do. Preserve that independence. Do not invoke the review skills in the editing session, simulate the independent reviewer, or claim that the spec passed re-review.

## Required inputs

Identify from the request and current conversation:

- the exact spec folder to revise;
- the findings supplied by the independent review session, including any proposed remedies;
- the task's existing goal, scope contract, and prior user decisions.

Infer an input only when the current context identifies it unambiguously. If the spec folder or the findings cannot be identified, ask one concise blocking question. Do not restart groundwork merely because an input was phrased informally.

Treat the supplied findings as a closed worklist. Preserve their IDs; if they have none, assign `F1`, `F2`, and so on only for tracking. Never add a finding, run a general quality sweep, or turn verification into a new review.

## Non-negotiable boundaries

1. **Write only inside the named spec folder.** Repository files outside it are read-only evidence. Before any outside edit, ask the user for permission and name the exact target plus the evidence-backed reason it is unavoidable.
2. **Edit the spec directly when the fix is confirmed and in scope.** Do not ask for routine approval or merely propose the patch.
3. **Never implement the spec.** Do not edit product code, tests, migrations, configuration, or runtime artifacts. Implementation belongs to `senior-implementer`.
4. **Never stage, commit, push, open a PR, or start the next pipeline skill.**
5. **Preserve unrelated work.** Judge and edit the current spec state; do not overwrite pre-existing user changes.
6. **No scope expansion.** Do not pull in future-task work, unrelated cleanup, speculative hardening, refactors, or a globally “better” design.

Focused searches and file reads outside the spec folder are allowed only to test a supplied claim. Finding an unrelated defect during that work does not add it to the worklist.

## Two independent judgments

A review can contain two claims:

1. **Finding claim:** the current spec has a real defect.
2. **Remedy claim, when supplied:** the reviewer's proposed change is the right way to resolve it.

The review text is neither evidence nor authority. Verify each supplied claim independently against the current spec, repository instructions, binding task decisions, roadmap/acceptance contract, live code and tests, established system patterns, relevant standards, and history. Use only sources that bear on the supplied finding. Never fabricate a remedy claim when the reviewer offered none.

### Evidence discipline

Before classifying a finding or remedy, decompose only the reasoning necessary to judge it into a compact premise chain: **claim → required factual premises → evidence for each premise → warranted conclusion**. Verify every premise on which the classification, proposed failure mechanism, root cause, closure condition, or chosen edit depends. One artifact may prove several premises; do not add ceremony when direct evidence is sufficient.

A plausible explanation, architectural intuition, familiar pattern, identifier name, comment, reviewer statement, or memory is not proof. The current spec proves what it says, but a challenged statement does not prove that the code, database, provider, protocol, or runtime behaves accordingly. An explicit binding user decision proves that decision, not an unstated technical mechanism.

Match the evidence method to the premise:

- prove positive repository facts from the exact current artifact and relevant context;
- prove absence, uniqueness, and exhaustive claims with targeted search across the plausible owners, recording the searched boundary rather than inferring from one familiar file;
- verify currentness when a claim can be stale, including the relevant live code, schema, tests, version, or history;
- verify external database, provider, protocol, language, or runtime semantics against an authoritative primary source;
- derive a conclusion only when its verified premises entail it; if multiple explanations remain possible, do not select one by familiarity.

Keep this proof claim-directed. Do not inspect unrelated surfaces or turn premise verification into a new review. If a required premise remains unverified after focused checking, do not silently fill the gap: a finding that depends on it is `REJECTED` as unsupported, not disproved; a remedy that depends on it is `REJECT`; and an unproved root cause or closure condition cannot authorize an edit. `BLOCKED` remains reserved for a confirmed issue that requires a previously unmade product/scope decision.

For each finding, keep a compact private ledger:

| Field | Allowed result |
|---|---|
| Finding | `CONFIRMED`, `REJECTED`, or `BLOCKED` |
| Proposed remedy | `USE`, `ADAPT`, `REJECT`, or `NOT_PROVIDED` |
| Evidence chain | Each required premise, its exact artifact, and the conclusion it warrants |
| Resolution | Spec edit, pushback reason, or decision dependency |

Do not dump this ledger into the final response.

### Finding judgment

- **CONFIRMED** — the issue is reproducible in the current spec, conflicts with binding evidence, and belongs to this task's scope.
- **REJECTED** — the claim is false, already fixed, stale, contradicted by stronger current evidence, unsupported after focused verification, or asks this task to own work outside its scope. When evidence is insufficient, say that precisely; do not pretend the claim was disproved.
- **BLOCKED** — the issue is confirmed, but a safe resolution requires a previously unmade product/scope decision. Do not invent that decision or disguise it as a technical choice.

A broadly useful improvement is not a confirmed finding when the task contract excludes it.

### Remedy judgment

Treat the proposed remedy as a candidate, never as the default. Evaluate it in this order:

1. **Correctness:** does it address the proven failure mechanism?
2. **Sufficiency:** does it fully close the finding and its binding acceptance condition?
3. **Compatibility and stability:** does it fit the current architecture, conventions, versions, and invariants without creating a regression?
4. **Scope and proportionality:** does it stay inside the task and avoid unnecessary machinery or change?

Then record:

- **USE** — use it substantially as proposed because it passes every check.
- **ADAPT** — preserve the valid part but make the smallest local change needed for correctness, sufficiency, fit, and stability.
- **REJECT** — do not use it because it is wrong, incomplete, fragile, incompatible, regression-causing, out of scope, disproportionate, or assumes an unresolved decision. Rejecting the proposal does not reject a confirmed finding.
- **NOT_PROVIDED** — the reviewer supplied no remedy. Do not invent one merely to evaluate it.

First require a correct and sufficient solution. Only among solutions that pass those gates choose the one with the smallest blast radius. For a `CONFIRMED` finding, smallest means the smallest root-complete resolution inside the current task boundary, not the fewest edited lines or the narrowest patch to the reported manifestation. Do not search for a globally superior design. If the review proposes new abstractions, modes, registries, extensibility, or future-proofing, require concrete evidence that the confirmed finding cannot be closed within the existing structure.

When a finding is `CONFIRMED` and its remedy is `REJECT` or `NOT_PROVIDED`, derive the resolution independently from the proven failure, binding task contract, and existing system. Use the smallest existing-system-fitting change that is correct and sufficient. If no such resolution can be selected without a product/scope decision, change the finding disposition to `BLOCKED`.

## Workflow

### 1. Establish the baseline

Read repository instructions, the complete current spec folder, the supplied review, and the task context. Inspect working-tree state so unrelated changes remain distinguishable.

Map every finding to:

- the exact current spec statement or omission it challenges;
- the authoritative evidence needed to test it;
- any other supplied finding or spec file that depends on its resolution.

This mapping is claim-directed. Do not inventory the repository for other risks.

### 2. Classify every finding before dependent edits

Verify each finding and its proposed remedy separately. Complete every required premise in the private evidence chain and the ledger before editing any finding whose resolution depends on another. Do not let an unverified premise pass merely because the conclusion appears likely.

If a `BLOCKED` finding controls other edits, pause those dependent edits. Apply confirmed fixes that are independent of it. Do not let one unresolved decision prevent unrelated, safe corrections.

### 3. Prove task-owned root-cause closure

Before selecting or applying a resolution for each `CONFIRMED` finding, trace the reported manifestation through the verified premise chain to the deepest evidence-supported cause owned by the current task. The reviewer's stated root cause or invariant is a lead to verify, not an authority. Every causal link must follow from proven premises; do not replace a missing link with a root assumption. Stop at the task-owned cause whose correction prevents the supplied defect from recurring across the task-owned surface; do not search for an ultimate architectural cause or unrelated defects.

Keep a compact private root-closure map:

| Map item | What to record |
|---|---|
| Reported manifestation | The exact failure the supplied finding demonstrates |
| Proven root cause | The task-owned cause established by the verified premise chain |
| Closure condition | The postcondition that must hold for the supplied defect to be impossible across the task-owned surface |
| Mandatory consequence surface | The clauses, branches, producers, consumers, states, references, or side effects that must agree for closure |
| Proof mode | The smallest evidence method sufficient to prove closure |

Choose the proof mode proportionately to the finding:

- for control-flow defects, trace every task-owned producer, branch, and early return that can produce the supplied failure;
- for API or state-coherence defects, trace the relevant producers and consumers and align the returned value, persisted state, external side effects, and ownership where applicable;
- for a wrong name, path, fact, or absence/exhaustiveness claim, use targeted search across its plausible task-owned dependents;
- for a scope or requirement contradiction, trace the binding task contract to every derived clause needed to close that contradiction;
- for an external mechanism claim, verify the necessary semantics against an authoritative primary source;
- for a simple typo or isolated local fact, keep the proof local plus any mandatory dependent references; do not force a branch matrix or interaction analysis.

A resolution passes root-cause closure only when it removes the proven cause across the mapped task-owned surface, propagates every mandatory in-scope consequence, leaves the relevant postconditions coherent, and adds no out-of-scope machinery. If the proposed remedy patches only the cited manifestation, mark it `ADAPT` or `REJECT`. If a supplied finding proves that an earlier accepted revision patched another manifestation of the same root cause, replace the partial workaround with the root-complete resolution instead of stacking another exception.

When the resolution clarifies a task-wide rule or invariant, state it once in the spec's authoritative location and make dependent sections operationalize it without conflicting paraphrases.

### 4. Resolve technical gaps without reopening the project

When a confirmed finding leaves a small technical detail open, resolve it from the current mechanism, repository patterns, prior task decisions, and standards. This is normal reconciliation, not a reason to rerun all of `task-groundwork`.

If resolution would change the product behavior or scope contract, reopen only that affected decision branch. Do not invent the answer and do not restart the full groundwork tree.

### 5. Apply surgical spec edits

For each `CONFIRMED` finding:

- apply the candidate directly when it is `USE`;
- apply its valid, narrowed form when it is `ADAPT`;
- when it is `REJECT`, discard the proposal and apply the independently derived, existing-system-fitting resolution;
- when it is `NOT_PROVIDED`, apply the independently derived, existing-system-fitting resolution without attributing it to the reviewer;
- use the private root-closure map and change only the clauses necessary to satisfy its closure condition across the mapped task-owned surface;
- update other files in the same spec folder only when the changed claim makes a dependency-cone consequence necessary to fully close the originating finding or avoid a semantic inconsistency;
- preserve the folder's existing structure, terminology, and level of detail.

Cross-file consistency is a consequence check, not permission for a fresh review. The regression audit below rereads the complete spec, but it tests only semantics introduced or changed by this run. Do not polish adjacent prose or normalize unrelated content.

For each `REJECTED` finding, make no change for that finding and retain the evidence needed for a one-line pushback.

For each `BLOCKED` finding:

- make no choice-dependent edit;
- for a real product/scope decision, present two or three evidence-based alternatives with their concrete impacts and ask the user to choose.

### 6. Run the change-induced regression audit

After applying the accepted resolutions, reread the complete current spec folder. Start from each finding's root-closure map and this run's diff, then answer only: **did these edits fail to close the proven task-owned cause, create or activate a contradiction, leave a required consequence unpropagated, or rely on an unproved claim?** This is self-verification of the revision, not a new review of the pre-existing spec.

Build a private impact map for every changed normative claim:

| Map item | What to record |
|---|---|
| Origin | Supplied finding ID and changed requirement |
| Root closure | Proven task-owned root cause and closure condition |
| Spec propagation | Every clause, matrix, acceptance criterion, task, test directive, standard, and example whose meaning depends on it |
| Contract propagation | Affected producer, return/result contract, current consumers, ownership, and error/terminal behavior |
| Interaction propagation | Actors and operations that touch the same changed state, identity, resource, lock, transaction, retry, or invariant |
| Proof mode | Direct source evidence, targeted search, contract trace, or bounded interleaving trace |

Run these checks for each map:

1. **Root-cause closure.** Verify that the latest diff satisfies the closure condition across the complete mapped task-owned surface. A change that fixes only the reported branch, example, sentence, or other manifestation does not pass.
2. **Whole-spec semantic propagation.** Compare the operational meaning of the changed claim with every dependent statement across the spec folder. A grep match locates candidates; it does not prove consistency. Check directives and their derived tests/acceptance criteria in both directions.
3. **Producer/consumer propagation, when triggered.** If the revision changes an interface, result type/status, state meaning, ownership rule, or failure behavior, search for the current producers and consumers of that exact contract. Verify that each dependent spec clause uses the same type, transition, authority, and terminal/error interpretation and, where applicable, that returned values, persisted state, external side effects, and ownership express the same authoritative postcondition.
4. **Interaction/interleaving propagation, when triggered.** If the revision changes concurrency, locks, transactions, state transitions, identity, supersession, retries, asynchronous work, or late results, enumerate only actors and operations that touch the same changed resource or invariant. Trace the relevant before/during/after, retry, late-result, and competing-owner cases. Do not form a cross-product with every public method or expand into unrelated actors.
5. **Negative and exhaustive claims.** For every new or strengthened claim such as “no,” “never,” “only,” “all,” “none,” “cannot,” or “already handled,” run a targeted repository search across the plausible owners. Reading one familiar file is not evidence of absence or exhaustiveness.
6. **External mechanism claims, when triggered.** If correctness depends on database, provider, protocol, language, or runtime semantics not established by repository evidence, verify the exact mechanism against an authoritative primary source rather than memory. A resolution that still rests on an unproved mechanism does not pass the correctness gate.

Attribute the result before acting:

- If reverting this run's edit would remove the contradiction, or the edit makes another clause newly inconsistent, treat it as a regression of the originating finding. Keep the same finding ID; repair the required dependent clauses or replace/revert the resolution. Do not mint a new finding.
- If the regression cannot be resolved without a previously unmade product/scope decision, remove the choice-dependent edit and change the originating finding to `BLOCKED`.
- If the issue would remain unchanged without this run's diff and is not required to close a supplied finding, it is pre-existing and unrelated. Do not edit or report it.

After any audit-driven edit, rebuild the affected impact map and rerun this audit against the complete spec folder. Continue until the latest diff introduces no regression.

### 7. Verify and stop

Inspect the resulting diff and prove all of the following before reporting:

- every edit maps to a supplied, confirmed finding;
- every finding, remedy, root cause, closure condition, and edit depends only on verified premises; no plausible but unproved assumption entered the decision path;
- every confirmed finding has an evidence-supported, task-owned root cause and closure condition proportionate to that finding;
- each confirmed finding is resolved at that root across its mapped task-owned surface, not merely reworded or patched at one manifestation;
- the change-induced regression audit ran after the latest edit, and every changed normative claim has complete semantic and triggered contract/interaction propagation;
- every regression found during that audit was resolved under its originating supplied finding ID rather than added as a new finding;
- rejected and blocked findings caused no unauthorized edits;
- only the named spec folder and any exact outside target explicitly authorized by the user for this run changed;
- mandatory cross-file consequences are consistent and no unrelated cleanup slipped in;
- no implementation, staging, commit, push, PR, or independent re-review occurred in the editing session.

If any check fails, repair the spec edit and repeat this verification. Stop when the supplied worklist is reconciled or a genuine decision blocks the remaining dependent items.

## Response contract

Keep the response short. Use only the applicable sections below and omit empty sections:

```text
Düzelttim:
- F1, F3: <çok kısa sonuç>

Değişiklik yapmadım:
- F2: <kanıta dayalı kısa gerekçe>

Karar gerekiyor:
- F4: <2–3 alternatif ve kısa etkileri; doğrudan "Hangisini seçelim?" diye sor>
```

Do not narrate the investigation, reproduce the private ledger, give a general spec review, or list every touched file unless that detail is necessary to understand a result. When no blocker remains, the next action is a separate session's independent re-review, not implementation. When a blocker remains, wait only for that decision, finish its dependent reconciliation, and then hand the revised spec back to a separate review session.
