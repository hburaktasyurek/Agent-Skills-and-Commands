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

Require the exact spec folder, the supplied findings including any proposed remedies, and the task's existing goal, scope contract, and user decisions. Infer only what the current context identifies unambiguously. If the folder or findings are missing, ask one concise blocking question; do not restart groundwork.

The supplied findings are a closed worklist. Preserve their IDs or assign `F1`, `F2`, and so on for tracking. Never add a finding or turn verification into a general review.

## Non-negotiable boundaries

1. **Write only inside the named spec folder.** Repository files outside it are read-only evidence. Before any outside edit, ask the user for permission and name the exact target plus the evidence-backed reason it is unavoidable.
2. **Edit the spec directly when the fix is confirmed and in scope.** Do not ask for routine approval or merely propose the patch.
3. **Never implement the spec.** Do not edit product code, tests, migrations, configuration, or runtime artifacts. Implementation belongs to `senior-implementer`.
4. **Never stage, commit, push, open a PR, or start the next pipeline skill.**
5. **Preserve unrelated work.** Judge and edit the current spec state; do not overwrite pre-existing user changes.
6. **No scope expansion.** Do not pull in future-task work, unrelated cleanup, speculative hardening, refactors, or a globally “better” design.
7. **Never report unaudited edits as complete.** After any spec edit, the full Step 6 audit against the latest edit is a completion prerequisite. Grep, targeted searches, diff inspection, spot checks, and confidence are inputs to that audit, not substitutes for it.

Focused searches and file reads outside the spec folder are allowed only to test a supplied claim. Finding an unrelated defect during that work does not add it to the worklist.

## Judge findings and remedies independently

For each supplied ID, judge two separate claims: whether the defect is real and whether the proposed remedy is right. Review text is a lead, not evidence or authority. Never invent a remedy claim when none was supplied.

Keep one compact private ledger:

| Field | Required content |
|---|---|
| Finding | `CONFIRMED`, `REJECTED`, or `BLOCKED` |
| Remedy | `USE`, `ADAPT`, `REJECT`, or `NOT_PROVIDED` |
| Premise chain | Claim → required facts → exact evidence → warranted conclusion |
| Root closure | Proven task-owned cause and the postcondition that closes it |
| Resolution | Spec edit, pushback reason, or decision dependency |

### Evidence gate

Verify every premise used to classify the finding or remedy, name a failure mechanism or root cause, define closure, or authorize an edit.

- Use the exact current artifact for positive repository facts.
- Prove absence, uniqueness, or exhaustiveness with targeted search across plausible owners; one familiar file is insufficient.
- Check live code, schema, tests, versions, or history when evidence may be stale.
- Verify external database, provider, protocol, language, or runtime semantics from an authoritative primary source.
- Infer only what verified premises entail. Plausibility, reviewer prose, architectural intuition, names, comments, patterns, and memory are not proof of behavior.
- A spec statement proves its wording and a binding user decision proves that decision; neither proves unstated external or technical behavior.

Keep verification limited to premises needed for the supplied claim. If a required premise remains unverified, do not fill the gap: mark a dependent finding `REJECTED` as unsupported, not disproved; mark a dependent remedy `REJECT`; and make no edit from an unproved root or closure condition. `BLOCKED` is only for a confirmed issue requiring a previously unmade product/scope decision.

### Decision meanings

- **CONFIRMED** — reproducible in the current spec, conflicts with binding evidence, and belongs to this task.
- **REJECTED** — false, fixed, stale, contradicted, unsupported after focused verification, or out of scope.
- **BLOCKED** — confirmed, but safe resolution requires a real unmade product/scope decision.
- **USE** — correct, sufficient, compatible, stable, in scope, and proportionate.
- **ADAPT** — contains a valid core but needs the smallest change that passes those gates.
- **REJECT** — wrong, incomplete, fragile, incompatible, regressive, disproportionate, out of scope, or decision-assuming.
- **NOT_PROVIDED** — no remedy was supplied.

Rejecting a remedy does not reject a confirmed finding. Derive its resolution from the proven failure, task contract, and existing system; if that still requires a new product/scope decision, use `BLOCKED`.

Choose the smallest **root-complete** in-scope solution, not the fewest lines or the narrowest symptom patch. Do not seek a globally superior design. New abstractions or future-proofing require proof that the existing structure cannot close the finding.

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

For each `CONFIRMED` finding, trace the manifestation through verified premises to the deepest cause this task owns. The reviewer's root or invariant is only a lead. Stop where correcting the task-owned cause prevents recurrence across the task-owned surface; do not pursue ultimate architecture or unrelated defects.

Privately record: manifestation, proven root, closure postcondition, mandatory consequence surface, and proportional proof mode.

- Control flow: trace every task-owned producer, branch, and early return that can produce the failure.
- API/state: align relevant producers, consumers, returned value, persisted state, side effects, and ownership.
- Wrong name/path/fact or absence claim: targeted search across task-owned dependents.
- Requirement conflict: trace the binding task contract to required derived clauses.
- External mechanism: authoritative primary source.
- Simple local fact: local proof plus dependent references; no forced matrix or interaction sweep.

Closure requires removing the proven cause across that surface, propagating every mandatory in-scope consequence, and adding no extra machinery. A manifestation-only remedy is `ADAPT` or `REJECT`. If a later supplied finding exposes an earlier partial workaround for the same root, replace it instead of stacking another exception.

When the resolution clarifies a task-wide rule or invariant, state it once in the spec's authoritative location and make dependent sections operationalize it without conflicting paraphrases.

### 4. Resolve technical gaps without reopening the project

Resolve small technical gaps from the current mechanism, repository patterns, prior decisions, and standards. If resolution would change product behavior or scope, reopen only that decision branch. Never invent the answer or restart the full `task-groundwork` tree.

### 5. Apply surgical spec edits

Maintain `revision_state`: start `NO_SPEC_EDIT`; any spec edit sets or resets `EDITED_UNAUDITED`; only Step 6 may set `AUDITED`.

When a planning or status mechanism is available, add a dedicated full post-edit audit item before the first edit and keep it incomplete while the state is `EDITED_UNAUDITED`. Do not create an audit file inside the spec folder merely to track this state.

For each `CONFIRMED` finding:

- `USE` the remedy, `ADAPT` it, or discard `REJECT`/`NOT_PROVIDED` and apply the independently proven existing-system resolution;
- change only the clauses required by root closure and its mandatory dependency cone;
- update another file in the named folder only when closure or semantic consistency requires it;
- preserve the folder's existing structure, terminology, and level of detail.

Cross-file consistency is not permission for fresh review or adjacent cleanup. Make no edit for `REJECTED`. For `BLOCKED`, make no choice-dependent edit; offer two or three evidence-based options and ask the user.

### 6. Run the mandatory post-edit audit

If `revision_state` is `EDITED_UNAUDITED`, run this sequence exactly:

1. Capture the latest diff and separately enumerate every current spec file inside the named folder; that full-folder list is the manifest, not the changed-files list.
2. **After the latest edit, reread every file in the full-folder manifest from beginning to end.** Grep, searches, snippets, and spot checks help locate evidence but never satisfy this reread.
3. Record the manifest and completed reread in the private receipt. Inventory every normative claim added, removed, or changed; no sampling or merging distinct claims.
4. Complete one private audit-receipt row per claim:

| Required field | Coverage |
|---|---|
| Origin | Finding ID and changed claim |
| Root closure | Proven root and closure condition across its task-owned surface |
| Spec propagation | All dependent clauses, matrices, tasks, standards, examples, tests, and acceptance criteria |
| Contract propagation | Triggered producers, consumers, type/state, return, persistence, ownership, side effects, and error/terminal meaning |
| Interaction propagation | Triggered actors on the same state/resource/invariant and bounded before/during/after, retry, late-result, or competing-owner traces |
| Proof | Targeted evidence, including negative/exhaustive searches and authoritative external sources when triggered |
| Result | `CONSISTENT` or `BLOCKED`; a needed repair or revert invalidates this receipt |

Root closure and whole-spec semantic propagation are always required. Contract and interaction checks run only when the changed claim triggers them; mark an untriggered field `N/A` with a reason. A match list is not semantic proof, and an interaction check is bounded to the changed resource or invariant rather than every public method.

Attribute only effects of this run:

- If reverting this run's edit removes the problem, or the edit makes another clause inconsistent, repair, replace, or revert under the same finding ID.
- If the regression cannot be resolved without a previously unmade product/scope decision, remove the choice-dependent edit and change the originating finding to `BLOCKED`.
- If the issue is unchanged without this run's diff and is not required for a supplied finding, leave it untouched and unreported.

Any audit-driven edit invalidates the entire receipt and resets `EDITED_UNAUDITED`; restart from step 1. Set `AUDITED` only when the manifest was fully reread after the latest edit, every changed normative claim has a complete row, and no edit-induced regression remains.

After interruption or compaction, missing or uncertain receipt evidence means `EDITED_UNAUDITED`; rerun Step 6. Never infer `AUDITED` from memory, a partial pass, or a small diff.

### 7. Verify and stop

Enter this step only when the revision state is `NO_SPEC_EDIT` or `AUDITED`. If it is `EDITED_UNAUDITED`, return to Step 6 instead of reporting, handing off, or waiting for the user to notice the omission.

Before reporting, inspect the final diff and verify:

- every edit maps to a supplied `CONFIRMED` finding and verified premises;
- each confirmed finding is root-complete across its task-owned surface;
- if edits occurred, the latest complete receipt proves the full reread and one row per changed normative claim;
- `REJECTED` and `BLOCKED` caused no unauthorized edit;
- only permitted spec targets changed, with no unrelated cleanup;
- no implementation, staging, commit, push, PR, or independent re-review occurred.

If any check fails, return to the responsible step. Stop only when the closed worklist is reconciled or a genuine decision blocks dependent items.

## Response contract

Keep the response short. Use only the applicable sections below and omit empty sections:

```text
Düzelttim:
- F1, F3: <çok kısa sonuç>

Değişiklik yapmadım:
- F2: <kanıta dayalı kısa gerekçe>

Karar gerekiyor:
- F4: <2–3 alternatif ve kısa etkileri; doğrudan "Hangisini seçelim?" diye sor>

Doğrulama:
- Tam post-edit audit: <N> spec dosyası yeniden okundu; <M> değişen normatif iddia için audit kaydı tamamlandı.
```

Include `Doğrulama` only when at least one spec edit occurred and the revision state is `AUDITED`; take both counts from the completed receipt. Its purpose is a terse completion proof, not an audit narrative.

Do not narrate the investigation, reproduce the private ledger or audit receipt, give a general spec review, or list every touched file unless that detail is necessary to understand a result. When no blocker remains, the next action is a separate session's independent re-review, not implementation. When a blocker remains, wait only for that decision, finish its dependent reconciliation, and then hand the revised spec back to a separate review session.
