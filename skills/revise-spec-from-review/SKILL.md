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

For each finding, keep a compact private ledger:

| Field | Allowed result |
|---|---|
| Finding | `CONFIRMED`, `REJECTED`, or `BLOCKED` |
| Proposed remedy | `USE`, `ADAPT`, `REJECT`, or `NOT_PROVIDED` |
| Evidence | Exact artifact and the fact it proves |
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

First require a correct and sufficient solution. Only among solutions that pass those gates choose the one with the smallest blast radius. Do not search for a globally superior design. If the review proposes new abstractions, modes, registries, extensibility, or future-proofing, require concrete evidence that the confirmed finding cannot be closed within the existing structure.

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

Verify each finding and its proposed remedy separately. Complete the private ledger before editing any finding whose resolution depends on another.

If a `BLOCKED` finding controls other edits, pause those dependent edits. Apply confirmed fixes that are independent of it. Do not let one unresolved decision prevent unrelated, safe corrections.

### 3. Resolve technical gaps without reopening the project

When a confirmed finding leaves a small technical detail open, resolve it from the current mechanism, repository patterns, prior task decisions, and standards. This is normal reconciliation, not a reason to rerun all of `task-groundwork`.

If resolution would change the product behavior or scope contract, reopen only that affected decision branch. Do not invent the answer and do not restart the full groundwork tree.

### 4. Apply surgical spec edits

For each `CONFIRMED` finding:

- apply the candidate directly when it is `USE`;
- apply its valid, narrowed form when it is `ADAPT`;
- when it is `REJECT`, discard the proposal and apply the independently derived, existing-system-fitting resolution;
- when it is `NOT_PROVIDED`, apply the independently derived, existing-system-fitting resolution without attributing it to the reviewer;
- change only the clauses necessary to close the proven failure;
- update other files in the same spec folder only when they would otherwise directly contradict the accepted fix;
- preserve the folder's existing structure, terminology, and level of detail.

Cross-file consistency is a consequence check, not permission for a fresh review. Do not polish adjacent prose or normalize unrelated content.

For each `REJECTED` finding, make no change for that finding and retain the evidence needed for a one-line pushback.

For each `BLOCKED` finding:

- make no choice-dependent edit;
- for a real product/scope decision, present two or three evidence-based alternatives with their concrete impacts and ask the user to choose.

### 5. Verify and stop

Inspect the resulting diff and prove all of the following before reporting:

- every edit maps to a supplied, confirmed finding;
- each confirmed finding is fully resolved, not merely reworded;
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
