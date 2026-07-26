---
name: revise-spec-from-review
description: Reconcile findings from a separate, independent review into a named spec folder without performing a new review. Atomize and verify each alleged defect, impact, and remedy against the binding task and current evidence; apply only confirmed, root-complete, in-scope edits; and stop rather than guess when resolution evidence, a product/scope decision, or outside-edit permission is missing. Use when the user supplies adversarial-spec-review or spec-readiness findings and asks to revise the spec. Never implement, edit outside the named spec folder without permission, commit, or push.
---

# revise-spec-from-review

Revise a spec in its authoring/editing session from findings produced in a separate review session. Act as a skeptical reconciler and editor, not as another reviewer and not as an implementer.

## Position in the pipeline

The loop is: authoring context runs `task-groundwork` and `to-spec` → separate context runs `adversarial-spec-review` and/or `spec-readiness` → authoring/editing context runs this skill → separate context re-reviews. Context independence matters; labels and session numbers do not. Never invoke or simulate the reviewer here or claim the spec passed re-review.

## Required inputs

Require the exact spec folder, supplied findings including any remedies they contain, and the existing task goal, scope contract, and user decisions. Infer only unambiguous context. If the folder or findings are missing, ask one concise blocking question; do not restart groundwork.

The supplied findings are a closed worklist. Preserve their parent IDs or assign `F1`, `F2`, and so on. Split a parent into internal sub-IDs such as `F1.a` only when it contains independently provable claims; this is normalization, not a new finding. Never turn verification into a general review.

## Non-negotiable boundaries

1. **The named spec folder is the default write scope.** Files outside it remain read-only evidence unless the user explicitly permits an unavoidable edit to an exact named target after hearing the evidence-backed reason.
2. **Edit the spec directly when the fix is confirmed and in scope.** Do not ask for routine approval or merely propose the patch.
3. **Never implement the spec.** Do not edit product code, tests, migrations, configuration, or runtime artifacts. Implementation belongs to `senior-implementer`.
4. **Never mutate Git state or open a PR.** Do not stage, commit, push, checkout/switch, restore/reset, stash, merge/rebase, tag, or create a worktree. Read-only Git inspection is allowed. Do not start the next pipeline skill.
5. **Preserve unrelated work.** Judge and edit the current spec state; do not overwrite pre-existing user changes.
6. **No scope expansion.** Do not pull in future-task work, unrelated cleanup, speculative hardening, refactors, or a globally “better” design.
7. **Never report unaudited edits as complete.** After any permitted edit, the full Step 6 audit against the latest edit is a completion prerequisite. Grep, targeted searches, diff inspection, spot checks, and confidence are inputs to that audit, not substitutes for it.

Every applicable step, gate, check, and boundary is a minimum mandatory condition. Skipping, weakening, sampling, or replacing one with an easier proxy is a failed run even if the edit looks correct. Resume at the missed requirement; never report partial success or completion. This floor does not broaden the worklist: gather only claim-directed evidence needed to prove a supplied finding, its root-complete resolution, or an effect of the latest edit.

Focused searches and file reads outside the spec folder are allowed only to test a supplied claim. Finding an unrelated defect during that work does not add it to the worklist.

## Judge findings and remedies independently

For each atomic claim, judge the alleged defect, alleged impact, and proposed remedy separately. Review text, severity, mechanism, cascade, and resolution are leads, not evidence or authority. Never invent a remedy claim when none was supplied.

Keep one compact private ledger:

| Field | Required content |
|---|---|
| Review item | Parent ID and any atomic sub-ID |
| Defect | `CONFIRMED`: current in-scope spec conflicts with binding evidence; `REJECTED`: proved false, fixed, stale, contradicted, or out of scope; `UNVERIFIED`: a required premise remains unproved |
| Impact | `VERIFIED`: proved as stated; `NARROWED`: proved only in a smaller form; `REJECTED`: disproved; `UNVERIFIED`: unproved |
| Remedy | `USE`: sufficient, compatible, stable, in scope, proportionate; `ADAPT`: valid core needs the smallest qualifying change; `REJECT`: proved wrong, incomplete, fragile, incompatible, regressive, disproportionate, out of scope, or decision-assuming; `UNVERIFIED`: a premise remains unproved; `NOT_PROVIDED`: absent |
| Resolution | `EDIT`: proved root-complete correction; `NO_CHANGE`: defect `REJECTED`/`UNVERIFIED`; `EVIDENCE_REQUIRED`: defect confirmed but no safe resolution is yet proved; `BLOCKED`: confirmed defect needs a real unmade product/scope decision; `PERMISSION_REQUIRED`: confirmed resolution requires an unavoidable outside-folder edit awaiting explicit permission |
| Premise chain | Claim → required facts → exact evidence → warranted conclusion |
| Root closure | Proven task-owned cause, falsifiable postcondition, and mandatory consequence surface |

### Evidence gate

Choose authority by premise type; there is no universal source hierarchy:

- Process and action boundaries come from repository instructions and this skill's non-negotiables.
- Intended behavior comes from the latest explicit user decision, then the most specific binding task/scope/acceptance contract, then its parent roadmap contract. A derived spec clause cannot override its source.
- Current behavior comes from live code, schema, migrations, configuration, relevant tests, and the actual call path. It proves the starting state, not that an intentional task change is invalid.
- External semantics come from version-relevant authoritative primary sources.
- History, comments, names, conventions, and analogous code are supporting evidence only unless a binding contract explicitly adopts them.

Every classification, cause, closure, and edit must follow the ledger's premise chain. Prove absence, uniqueness, or exhaustiveness by searching plausible owners; one familiar file is insufficient. Infer only what proof entails: plausibility, reviewer prose, intuition, names, comments, patterns, and memory do not prove behavior. When the task is silent, verified existing structure may settle a technical detail but cannot invent product behavior or scope.

Keep verification limited to premises needed for the supplied claim. If a required premise remains unproved after a focused search, mark only the dependent defect, impact, or remedy `UNVERIFIED`, state the missing premise and search boundary, and make no edit that relies on it. A separately proved flaw may still make a remedy `REJECT`; missing proof alone may not. Do not call an unverified claim false. If the defect is confirmed but no target-compatible resolution can be proved, use `EVIDENCE_REQUIRED`. Reserve `BLOCKED` for a real unmade product/scope decision.

Rejecting a remedy does not reject a confirmed finding. Derive its resolution from the proven failure, binding target contract, and verified system constraints; if that still requires a new product/scope decision, use `BLOCKED`.

Choose the smallest **root-complete** in-scope solution, not the fewest lines or the narrowest symptom patch. Do not seek a globally superior design. New abstractions or future-proofing require proof that the existing structure cannot close the finding.

## Workflow

### 1. Establish the baseline

Read repository instructions, the complete current spec folder, the supplied review, and the task context. Inspect working-tree state so unrelated changes remain distinguishable.

Map every finding to:

- its parent ID and independent atomic claims;
- the exact current spec statement or omission it challenges;
- its alleged mechanism/gap, cascade/consequence, and proposed resolution;
- each premise type and the corresponding authoritative evidence needed to test it;
- any other supplied finding or spec file that depends on its resolution.

This mapping is claim-directed. Do not inventory the repository for other risks.

### 2. Classify every finding before dependent edits

Atomize and classify every defect, impact, and remedy in the closed worklist before the first edit. Build a dependency graph among the supplied atoms and resolve roots before dependents; reviewer severity remains metadata and does not override dependency order. Do not let an unverified premise pass merely because the conclusion appears likely.

One parent may have mixed outcomes. If an `EVIDENCE_REQUIRED`, `BLOCKED`, or `PERMISSION_REQUIRED` atom controls other edits, pause its dependents and apply confirmed fixes that are independent. Do not let one unresolved item prevent unrelated safe corrections.

### 3. Prove task-owned root-cause closure

For each `CONFIRMED` defect, walk upstream only through verified causal links. The task-owned root is the deepest proved cause this task owns whose correction makes the atomic failure impossible across every task-owned manifestation. The reviewer's root or invariant is only another claim.

Stop walking upstream when the next cause is outside scope, does not change this task's resolution, or requires a new product choice. If one root does not explain every manifestation, split the claim again instead of inventing a convenient invariant.

Privately record: manifestation, proven root, closure postcondition, mandatory consequence surface, and proportional proof mode.

- Control flow: trace every task-owned producer, branch, and early return that can produce the failure.
- API/state: align relevant producers, consumers, returned value, persisted state, side effects, and ownership.
- Wrong name/path/fact or absence claim: targeted search across task-owned dependents.
- Requirement conflict: trace the binding task contract to required derived clauses.
- External mechanism: authoritative primary source.
- Simple local fact: local proof plus dependent references; no forced matrix or interaction sweep.

The closure postcondition must be falsifiable, derive from the binding target contract, and state what must remain true; “call method X” is not closure. Remove the cause across its task-owned surface, propagate every mandatory in-scope consequence, and add no extra machinery. A manifestation-only remedy is `ADAPT` or `REJECT`. Replace an earlier partial workaround for the same root instead of stacking another exception.

When the resolution clarifies a task-wide rule or invariant, state it once in the spec's authoritative location and make dependent sections operationalize it without conflicting paraphrases.

### 4. Resolve technical gaps without reopening the project

Resolve a small technical gap only when the binding target plus verified current mechanisms or adopted standards permit the choice. Repository patterns may locate candidate evidence but cannot authorize behavior. If resolution would change product behavior or scope, reopen only that decision branch. Never invent the answer or restart the full `task-groundwork` tree.

### 5. Apply surgical spec edits

Maintain `revision_state`: start `NO_SPEC_EDIT`; any permitted edit sets or resets `EDITED_UNAUDITED`; only Step 6 may set `AUDITED`.

When a planning or status mechanism is available, add a dedicated full post-edit audit item before the first edit and keep it incomplete while the state is `EDITED_UNAUDITED`. Do not create an audit file inside the spec folder merely to track this state.

For each `CONFIRMED` defect with resolution `EDIT`:

- `USE` the remedy, `ADAPT` it, or discard `REJECT`/`UNVERIFIED`/`NOT_PROVIDED` and apply an independently proven target-compatible resolution, reusing existing structure only when compatible;
- before writing, verify the replacement itself against closure and the edited boundary's input, output type/value, state/persistence, ownership, side effects, and consumer contracts;
- edit the smallest semantic closure cone, not merely the fewest lines or files;
- include a dependent clause only when leaving it unchanged would contradict the canonical rule, require different acceptance/test behavior, make producer/consumer/state/ownership/side-effect contracts incoherent, or permit the same defect through another task-owned path;
- preserve the folder's existing structure, terminology, and level of detail.

Resolve root atoms before their dependents. One edit may close multiple supplied atoms; record every origin ID instead of duplicating text. Cross-file consistency is not permission for fresh review or adjacent cleanup. Make no edit for a defect classified `REJECTED` or `UNVERIFIED`, and never rely on an `UNVERIFIED` impact or remedy. For `EVIDENCE_REQUIRED`, report the missing resolution premise and focused search boundary. For `BLOCKED`, make no choice-dependent edit and offer two or three evidence-based options. For `PERMISSION_REQUIRED`, audit independent authorized edits first, then ask with the exact outside target and necessity; permission changes it to `EDIT`, denial leaves it unresolved.

### 6. Run the mandatory post-edit audit

If `revision_state` is `EDITED_UNAUDITED`, run this sequence exactly:

1. Capture the latest diff. Enumerate every current spec file inside the named folder and add every permitted outside file edited by this run; this full list is the audit manifest, not the changed-files list.
2. **After the latest edit, reread every file in the audit manifest from beginning to end.** Grep, searches, snippets, and spot checks help locate evidence but never satisfy this reread.
3. Record the manifest and reread in the private receipt. Inventory every distinct semantic claim added, removed, or changed. A claim is one independently testable obligation, prohibition, guarantee, or state rule. Repeated occurrences share one row with all occurrences in propagation; independent requirements in one sentence get separate rows. Do not sample or merge distinct claims.
4. Complete one private audit-receipt row per claim:

| Required field | Coverage |
|---|---|
| Origin | Finding ID(s) and changed claim |
| Root closure | Proven root and closure condition across its task-owned surface |
| Spec propagation | All dependent clauses, matrices, tasks, standards, examples, tests, and acceptance criteria |
| Contract propagation | Triggered producers, consumers, type/state, return, persistence, ownership, side effects, and error/terminal meaning |
| Interaction propagation | Triggered actors on the same state/resource/invariant and bounded before/during/after, retry, late-result, or competing-owner traces |
| Proof | Targeted evidence, including negative/exhaustive searches and authoritative external sources when triggered |
| Result | `CONSISTENT` only; a needed repair, revert, or decision invalidates this receipt |

Root closure and whole-spec semantic propagation are always required. Contract and interaction checks run only when the changed claim triggers them; mark an untriggered field `N/A` with a reason. A match list is not semantic proof, and an interaction check is bounded to the changed resource or invariant rather than every public method.

Attribute only effects of this run:

- If reverting this run's edit removes the problem, or the edit makes another clause inconsistent, repair, replace, or revert under the same finding ID.
- If safe resolution now lacks evidence, a product/scope decision, or outside-edit permission, remove the dependent edit, set `EVIDENCE_REQUIRED`, `BLOCKED`, or `PERMISSION_REQUIRED` as the evidence dictates, and restart the audit for the remaining latest diff.
- If the issue is unchanged without this run's diff and is not required for a supplied finding, leave it untouched and unreported.

Any audit-driven edit invalidates the entire receipt and resets `EDITED_UNAUDITED`; restart from step 1. Set `AUDITED` only when the audit manifest was fully reread after the latest edit, every changed semantic claim has a complete row, and no edit-induced regression remains.

After interruption or compaction, missing or uncertain receipt evidence means `EDITED_UNAUDITED`; rerun Step 6. Never infer `AUDITED` from memory, a partial pass, or a small diff.

### 7. Verify and stop

Enter this step only when the revision state is `NO_SPEC_EDIT` or `AUDITED`. If it is `EDITED_UNAUDITED`, return to Step 6 instead of reporting, handing off, or waiting for the user to notice the omission.

Before reporting, inspect the final diff and verify:

- every edit maps to a supplied `CONFIRMED` finding and verified premises;
- each confirmed finding is root-complete across its task-owned surface;
- if edits occurred, the latest complete receipt proves the full reread and one row per changed semantic claim;
- no edit relies on an `UNVERIFIED` impact or remedy, and no defect classified `REJECTED`/`UNVERIFIED` or unresolved resolution caused an unauthorized edit;
- only authorized targets changed, with no unrelated cleanup;
- no implementation, Git-state mutation, PR, or independent re-review occurred.

The batch is locally reconciled only when every atom is `EDIT` with the latest audit complete or `NO_CHANGE`. `EVIDENCE_REQUIRED`, `BLOCKED`, and `PERMISSION_REQUIRED` are unresolved stop states. Local reconciliation is not a readiness verdict: never claim `READY`, passed review, or global adequacy. The user decides final adequacy after the separate review output.

If any check fails, return to the responsible step. Stop only when the worklist is locally reconciled or missing resolution evidence, a genuine decision, or required permission prevents safe progress.

## Response contract

Keep the response short. Use only the applicable sections below and omit empty sections:

```text
Düzelttim:
- F1, F3.a: <çok kısa sonuç>

Değişiklik yapmadım:
- F2: <kanıta dayalı kısa gerekçe>

Kanıtlanamadı:
- F3.b: <eksik öncül ve odaklı arama sınırı>

Karar gerekiyor:
- F4: <en erken belirleyici ürün/kapsam kararı için 2–3 alternatif ve kısa etkileri; doğrudan "Hangisini seçelim?" diye sor>

İzin gerekiyor:
- F5: <spec klasörü dışındaki kesin hedef ve değişikliğin neden zorunlu olduğu>

Doğrulama:
- Tam post-edit audit: <N> spec dosyası[ + <K> izinli dış hedef] yeniden okundu; <M> değişen semantik iddia için audit kaydı tamamlandı.
```

Include `Doğrulama` only when at least one permitted edit occurred and the revision state is `AUDITED`; omit the bracketed outside-target count when zero and take all counts from the receipt. Its purpose is terse completion proof, not an audit narrative.

Report parent IDs by default; expose sub-IDs only when mixed outcomes need explanation. For `REJECTED`, state the tested claim, decisive evidence, and concise no-change reason. For `UNVERIFIED`, state the missing premise without calling it false. Mention a rejected or unverified reviewer remedy only when it materially explains the applied alternative.

Do not narrate the investigation, reproduce the private ledger or audit receipt, give a general spec review, or list every touched file unless needed to understand a result. Surface only the earliest controlling unresolved item; apply independent safe edits first. When none remains, call the batch locally reconciled; call it audited only if edits occurred and `revision_state` is `AUDITED`. Then hand it to a separate session for independent re-review—not implementation. Otherwise wait only for the missing evidence, decision, or permission, finish dependent reconciliation, and then hand it back for separate re-review.
