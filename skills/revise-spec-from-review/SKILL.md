---
name: revise-spec-from-review
description: >-
  Reconcile findings from a separate, independent review into a named spec folder without independently
  searching for unrelated pre-existing defects. Act as the senior engineer responsible for the affected area
  and task outcome: atomize and verify each alleged defect, impact, and remedy, then carry every confirmed
  finding through all required prerequisites, dependencies, spec surfaces, and post-edit effects for
  root-complete, in-scope closure. Stop rather than guess when resolution evidence, a product/scope decision,
  or outside-edit permission is missing. Use when the user supplies adversarial-spec-review or spec-readiness
  findings and asks to revise the spec. Never implement, edit outside the named spec folder without permission,
  commit, or push.
---

# revise-spec-from-review

Revise a spec in its authoring/editing session from findings produced in a separate review session. Act as the senior engineer who owns their complete, safe spec closure—not as a separate finding-discovery reviewer or an implementer.

## Position in the pipeline

The loop is: authoring context runs `task-groundwork` and `to-spec` → separate context runs `adversarial-spec-review` and/or `spec-readiness` → authoring/editing context runs this skill → separate context re-reviews. Context independence matters; labels and session numbers do not. Never invoke or simulate an independent finding-discovery review here or claim the spec passed re-review.

## Required inputs

Require the exact spec folder, supplied findings including any remedies they contain, and the existing task goal, scope contract, and user decisions. Infer only unambiguous context. If the folder or findings are missing, ask one concise blocking question; do not restart groundwork.

The supplied findings are a closed worklist. Preserve their parent IDs or assign `F1`, `F2`, and so on. Split a parent into internal sub-IDs such as `F1.a` only when it contains independently provable claims; this is normalization, not a new finding. Never turn verification into a general review.

Treat the required task outcome—not the reviewer's proposed edit—as the unit of work. The closed worklist limits why you may enter the spec, not how far you must inspect or update within the task-owned closure of a confirmed finding. Its verified prerequisites, dependencies, contracts, interactions, and edit effects remain part of that finding; unrelated pre-existing defects do not.

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

Extract a remedy whenever the reviewer proposes any action, requirement, prohibition, replacement, or named solution, even when it is phrased inside the finding rather than under a “remedy” label. Statements such as “add X,” “release after Y,” or “document Z must be synchronized” are remedies. Use `NOT_PROVIDED` only when the review supplies no proposed change at all; use `UNVERIFIED` when a supplied remedy depends on an unproved premise.

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

Keep verification limited to premises needed for the supplied claim. If a required premise remains unproved after a focused search, mark only the dependent defect, impact, or remedy `UNVERIFIED`, state the missing premise and search boundary, and make no edit that relies on it. A separately proved flaw may still make a remedy `REJECT`; missing proof alone may not. Do not call an unverified claim false. An external claim with no proved applicability, version, or primary-source rule is `UNVERIFIED`; absence from local or supplied evidence does not disprove it, even when that local evidence set is complete. If the defect is confirmed but no target-compatible resolution can be proved, use `EVIDENCE_REQUIRED`. Reserve `BLOCKED` for a real unmade product/scope decision.

Proof that a helper is landed, compatible, or callable proves none of its exact signature, argument expression, returned-value handoff, or invocation syntax unless the evidence also establishes that detail. Specify only the proven operational detail; otherwise state the required outcome and leave the mechanism non-canonical.

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

One parent may have mixed outcomes. Assign each atom its intrinsic resolution before dependency handling. If an `EVIDENCE_REQUIRED`, `BLOCKED`, or `PERMISSION_REQUIRED` atom controls another unresolved atom, annotate the dependent as `DEPENDENCY_PAUSED_BY <ID>` without relabelling its intrinsic state; for example, an exact outside-folder edit remains `PERMISSION_REQUIRED (DEPENDENCY_PAUSED_BY F5)`, not `BLOCKED`. Apply confirmed fixes that are independent. Do not let one unresolved item prevent unrelated safe corrections.

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

When the resolution clarifies a task-wide rule or invariant, state the required outcome once in the spec's authoritative location and make dependent sections operationalize it without conflicting paraphrases. Do not elevate a reviewer-suggested or currently available helper, method, factory, SQL shape, or algorithm into that canonical rule unless binding evidence requires the exact mechanism. Compatibility alone never justifies adding mechanism detail; name one operationally only when verified evidence proves that exact handoff is necessary to express the task-owned closure at the spec's existing level of detail. This is not a readiness verdict. Tests and acceptance criteria must assert the required observable behavior, not turn a non-binding mechanism into a test obligation.

### 4. Resolve technical gaps without reopening the project

Resolve a small technical gap only when the binding target plus verified current mechanisms or adopted standards permit the choice. Repository patterns may locate candidate evidence but cannot authorize behavior. If resolution would change product behavior or scope, reopen only that decision branch. Never invent the answer or restart the full `task-groundwork` tree.

### 5. Apply surgical spec edits

Maintain `revision_state`: start `NO_SPEC_EDIT`; any permitted edit sets or resets `EDITED_UNAUDITED`; only Step 6 may set `AUDITED`.

When a planning or status mechanism is available, add a dedicated full post-edit audit item before the first edit and keep it incomplete while the state is `EDITED_UNAUDITED`. Do not create an audit file inside the spec folder merely to track this state.

For each `CONFIRMED` defect with resolution `EDIT`:

- `USE` the remedy, `ADAPT` it, or discard `REJECT`/`UNVERIFIED`/`NOT_PROVIDED` and apply an independently proven target-compatible resolution, reusing existing structure only when compatible;
- before writing, verify the replacement itself against closure and the edited boundary's exact mechanism/input only when specified, output type/value, state/persistence, ownership, side effects, and consumer contracts;
- edit the smallest semantic closure cone, not merely the fewest lines or files;
- include a dependent clause only when leaving it unchanged would contradict the canonical rule, require different acceptance/test behavior, make producer/consumer/state/ownership/side-effect contracts incoherent, or permit the same defect through another task-owned path; express tests and acceptance in observable outcomes unless an exact mechanism is binding;
- preserve the folder's existing structure, terminology, and level of detail.

Removing a former deferred actor or helper from the operational plan does not by itself justify a test that asserts the actor/helper is never invoked. Add a non-invocation test only when that absence is itself a binding observable or safety property; otherwise test the completed state, value, ownership, and return boundary.

Resolve root atoms before their dependents. One edit may close multiple supplied atoms; record every origin ID instead of duplicating text. Cross-file consistency is not permission for fresh review or adjacent cleanup. Make no edit for a defect classified `REJECTED` or `UNVERIFIED`, and never rely on an `UNVERIFIED` impact or remedy. For `EVIDENCE_REQUIRED`, report the missing resolution premise and focused search boundary. For `BLOCKED`, make no choice-dependent edit and offer two or three evidence-based options. For `PERMISSION_REQUIRED`, audit independent authorized edits first, then ask with the exact outside target and necessity; permission changes it to `EDIT`, denial leaves it unresolved.

### 6. Run the mandatory post-edit audit

If `revision_state` is `EDITED_UNAUDITED`, run this sequence exactly:

1. Capture the latest diff. Enumerate every current spec file inside the named folder and add every permitted outside file edited by this run; this full list is the audit manifest, not the changed-files list. Count each file path once: sections, clauses, and other surfaces never increase the manifest count or response `N`.
2. **After the latest edit, reread every file in the audit manifest from beginning to end.** Grep, searches, snippets, and spot checks help locate evidence but never satisfy this reread.
3. **Account for every edit.** Give each independently purposed part of the latest diff a `D` ID. Map every `D` ID exactly once to its supplied `CONFIRMED → EDIT` atom and one root-closure path. One mapping may cite multiple origin IDs when the same edit closes them together. An unmapped, multiply mapped, unrelated, or unverified edit must be repaired or reverted and forbids `AUDITED`.
4. **Inventory changed contract claims.** From the latest baseline and final manifest, record one row per added, removed, or meaningfully changed normative obligation at a task-owned contract boundary:

| Field | Required content |
|---|---|
| Claim | `C` ID and finding origin |
| Before → after | Exact behavioral obligation changed by this run |
| Surface | Canonical clause and every dependent plan, shape, test, acceptance, matrix, or example surface whose applicability changed |
| Closure path | Root-closure path ID(s) that prove it |
| Result | `PASS` only |

Treat public outcome/type/value, state/terminal meaning, persistence, ownership/lease, externally relevant side effects, and causally material order or actor interaction as separate claims only when they can fail independently, require different proof, or affect a different consumer/owner. A test repeating the same behavior is a propagation surface, not a new claim, unless it adds a distinct test obligation.

Do **not** turn an unchanged helper's signature, internal verbs, adjacent operation order, or every pre-existing caller occurrence into changed claims merely because a new caller uses it. Those details are evidence in the closure trace unless the exact mechanism/order is binding or this run actually changes their normative contract. Lexical token differences are not semantic claims; conversely, a materially different value, type, owner, state, or public boundary may not be hidden inside a bundled row.
5. **Complete one root-closure row per independently failing task-owned path**, not per word or helper operation:

| Required field | Coverage |
|---|---|
| Path and origin | Path ID, finding atom, affected producer/branch, and mapped `D`/`C` IDs |
| Root and postcondition | Proven task-owned cause and falsifiable closure condition |
| Canonical contract | Binding outcome and final authoritative clause |
| Producer/consumer trace | Final control/data flow through the actual public boundary, including relevant input, returned type/value, and consumer |
| State and effects | Relevant state/terminal meaning, persistence, ownership/lease, and side effects |
| Interaction/order | Only actors and ordering material to this closure; bounded before/during/after, retry, late-result, or competing-owner trace when triggered |
| Spec propagation | Every dependent clause, test, acceptance criterion, matrix, example, and other mandatory surface |
| Negative sweep | Complete-manifest search for the removed behavior, stale actor/value/type, contradictory outcome, and obsolete test expectation |
| Proof/result | Exact evidence and `PASS`; use `N/A` only with a reason |

Split paths that can still fail independently or need different evidence. An unchanged helper may prove a path, but its name or internals do not become canonical. When a closure relies on such a mechanism, the row must explicitly prove every behaviorally material guarantee needed from it—such as identity scope, atomicity/concurrency behavior, returned value and hydration, state/persistence/ownership effects, or terminal/error meaning—and trace the required output to its consumer. Merely citing the helper, its compatibility, or a match list is not semantic proof.
6. **Run the whole-manifest gate.** Confirm that:
   - every `D` ID and every changed contract claim is covered;
   - every mandatory consequence surface recorded in Step 3 appears in a closure row;
   - producer, consumer, public type/value, state, persistence, ownership, side effects, terminal/error meaning, and material interactions remain coherent;
   - the negative sweep finds no stale or contradictory path;
   - no edit relies on a `REJECTED`/`UNVERIFIED` claim or remedy, exceeds permission/scope, implements the spec, mutates Git, or simulates re-review.

Attribute only effects of this run. If reverting this run's edit removes an audit problem, or the edit makes another clause inconsistent, repair, replace, or revert under the same finding ID. If the problem is unchanged without this run and is not required for a supplied finding, leave it untouched and unreported.

Any audit-driven edit invalidates the full diff map, claim inventory, and closure ledger, resets `EDITED_UNAUDITED`, and restarts from step 1. Set `AUDITED` only when the latest manifest was fully reread, every edit and changed contract claim is accounted for, every closure row and whole-manifest gate passes, and no edit-induced regression remains.

After interruption or compaction, missing or uncertain receipt evidence means `EDITED_UNAUDITED`; rerun Step 6. Never infer `AUDITED` from memory, a partial pass, or a small diff.

### 7. Verify and stop

Enter this step only when the revision state is `NO_SPEC_EDIT` or `AUDITED`. If it is `EDITED_UNAUDITED`, return to Step 6 instead of reporting, handing off, or waiting for the user to notice the omission.

Before reporting, inspect the final diff and verify:

- every edit maps to a supplied `CONFIRMED` finding and verified premises;
- each confirmed finding is root-complete across its task-owned surface;
- if edits occurred, the latest receipt proves the full reread, complete diff/changed-claim accounting, and one passing row per independent closure path;
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
- Tam post-edit audit: <N> spec dosyası[ + <K> izinli dış hedef] yeniden okundu; <M> bağımsız kök-kapanış yolu doğrulandı.
```

Include `Doğrulama` only when at least one permitted edit occurred and the revision state is `AUDITED`; omit the bracketed outside-target count when zero and take all counts from the receipt. `M` is the number of independently failing task-owned paths, not clauses, tokens, helper operations, or claim rows. Its purpose is terse completion proof, not an audit narrative.

Report parent IDs by default; expose sub-IDs only when mixed outcomes need explanation. Put a `REJECTED` defect under `Değişiklik yapmadım` with the tested claim, decisive evidence, and concise no-change reason. Put every `UNVERIFIED` defect under `Kanıtlanamadı`, never under `Değişiklik yapmadım`; state the missing premise without calling it false. Mention a rejected or unverified reviewer remedy only when it materially explains the applied alternative.

Do not narrate the investigation, reproduce the private ledger or audit receipt, give a general spec review, or list every touched file unless needed to understand a result. Apply and audit independent safe edits first. Then surface exactly one unresolved atom per response—the earliest by dependency order, then review order—and defer every later or independent unresolved atom until it is resolved. When none remains, call the batch locally reconciled; call it audited only if edits occurred and `revision_state` is `AUDITED`. Then hand it to a separate session for independent re-review—not implementation. Within a classified worklist, wait only for an atom ending `EVIDENCE_REQUIRED`, `BLOCKED`, or `PERMISSION_REQUIRED`; a defect ending `UNVERIFIED → NO_CHANGE` is reconciled and never creates a wait state. After the missing resolution evidence, decision, or permission arrives, finish dependent reconciliation and hand it back for separate re-review.
