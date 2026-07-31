---
name: revise-spec-from-review
description: "Reconcile supplied adversarial-spec-review or spec-readiness findings into a named spec folder, closing each confirmed root across its producers, consumers, state, and tests without introducing a new contradiction. Use when revising a spec from complete review findings. Triggers: revise-spec-from-review."
---

# revise-spec-from-review

## Role

Safely revise one existing four-file spec from complete findings produced in a
separate review session. Own the correction as the spec author; do not act as a
new reviewer or implementer.

The findings are a closed worklist. They limit why this run may enter the spec,
but a confirmed finding must be closed across every task-owned producer,
consumer, state/effect, and acceptance surface needed to make that finding
impossible. This is propagation, not permission for unrelated defect hunting.

Local reconciliation never means `PASS`, `READY`, or implementation-ready. A
separate session reruns the review that failed.

## Required inputs

Require:

- the exact spec folder;
- the complete failed review output, including its evidence and remedies;
- the binding task goal, scope/non-goals, and prior user decisions.

Infer only unambiguous paths and context. If the folder or findings are absent,
ask one concise blocking question; do not restart groundwork.

Preserve review IDs or assign `F1`, `F2`, and so on. Split a finding internally
only when its claims can have different evidence or outcomes.

## Authority and evidence

Judge the defect, impact, and proposed remedy independently. Reviewer prose is
a lead, not authority.

- intended behavior: latest explicit user decision, then the most specific
  binding task/acceptance contract;
- current behavior: live code, schema, configuration, tests, and call paths;
- external behavior: applicable versioned primary documentation;
- process/write limits: repository instructions and this skill.

History, names, comments, patterns, and plausible mechanisms support a claim
but do not prove product behavior. Prove absence or exhaustiveness across
plausible owners. Compatibility with an existing helper does not prove its
exact signature or make that helper the canonical requirement.

Use these private classifications:

- **Defect:** `CONFIRMED`, `REJECTED`, or `UNVERIFIED`.
- **Impact:** `VERIFIED`, `NARROWED`, `REJECTED`, or `UNVERIFIED`.
- **Remedy:** `USE`, `ADAPT`, `REJECT`, `UNVERIFIED`, or `NOT_PROVIDED`.
- **Resolution:** `EDIT`, `NO_CHANGE`, `EVIDENCE_REQUIRED`,
  `DECISION_REQUIRED`, or `PERMISSION_REQUIRED`.

Rejecting a proposed remedy does not reject a confirmed defect. Choose the
smallest root-complete correction entailed by the binding contract. If a
required premise remains unproved, do not edit from it. If alternatives change
product behavior, scope, or a public contract and no authority selects one,
the result is `DECISION_REQUIRED`, not a guessed edit.

## Procedure

### 1. Establish the exact baseline

Read repository instructions, the complete current spec folder, the complete
review, task context, and working-tree state. Map each finding to:

- the challenged current clause or omission;
- the alleged mechanism and consequence;
- the supplied remedy, including actions embedded in prose;
- the evidence needed to test each premise;
- other supplied findings or spec surfaces that depend on it.

Classify every finding before the first edit. Resolve root findings before
dependent ones. Apply independent safe findings even when another finding must
stop for evidence, a decision, or permission.

### 2. Build a pre-edit closure preview

This step is mandatory for every proposed edit and happens **before files are
changed**.

For each confirmed finding, record privately:

1. the task-owned root and a falsifiable postcondition;
2. the canonical rule that would change;
3. every current producer, branch, carrier, or input combination that can reach
   that rule;
4. the public result/factory/value state each producer would emit;
5. every consumer, authority action, persisted state, ownership rule, side
   effect, retry, or recovery path affected by that result;
6. every dependent spec clause, matrix, example, task, acceptance criterion,
   and test oracle that must agree.

Now perform a counterfactual check: treat the candidate replacement as already
binding while leaving the files untouched, then rebuild the affected reachable
rows from the **current** spec.

Stop the candidate before editing when it would:

- make an existing producer emit a result its factory or consumer rejects;
- make a documented state unconstructible or erase required identity/data;
- assign conflicting terminal, recovery, ownership, or side-effect meanings;
- require a previously unmade product/public-contract decision; or
- leave a quantified acceptance set without a defined row or rejection.

If binding evidence already determines the missing consequence, add it to the
same closure preview and propagate it. If not, mark the finding
`DECISION_REQUIRED` and make **no partial or choice-dependent edit for that
finding**. Writing a matrix while leaving one affected row “unspecified” is not
closure.

Simple local facts need only a direct dependent-reference trace. Do not force a
matrix where inputs cannot vary independently or behavior does not change.

### 3. Ask usable decision questions

For `DECISION_REQUIRED`, explain before using internal labels:

- the real scenario and why it can occur;
- why a choice is necessary now;
- two or three options, each with observable runtime behavior and its principal
  safety/product consequence;
- one recommendation derived from binding evidence and reversibility/safety;
- exactly one plain-language question.

Do not present only names such as “throw / unknown / definite.” Do not make the
choice-dependent edit while waiting. Ask only the earliest unresolved decision
in dependency order; preserve later items for the next continuation.

### 4. Apply the semantic closure cone

For each `CONFIRMED → EDIT` finding:

- state the governing outcome once in the spec's canonical location;
- update every producer and carrier that can reach it;
- keep factory/value invariants and consumer/action contracts mutually valid;
- preserve required identity, provenance, state, ownership, persistence, and
  side-effect semantics;
- align dependent matrices, examples, implementation tasks, acceptance
  criteria, and counterexample tests;
- remove or replace earlier partial wording for the same root instead of
  stacking another exception.

Edit only the named spec folder unless an unavoidable exact outside target is
explicitly approved. Match the folder's terminology and useful level of detail.
Do not make an implementation helper canonical unless binding evidence requires
that exact mechanism; prefer observable outcomes.

### 5. Run the mandatory post-edit audit

Any edit creates an unaudited state. Completion requires this exact final-state
check:

1. Capture the latest diff and enumerate every file in the spec folder plus any
   explicitly permitted outside edit.
2. Reread every file in that manifest from beginning to end after the latest
   edit; searches and snippets are not substitutes.
3. Map every meaningful diff part to one supplied confirmed finding and its
   root/postcondition. Remove unrelated or unproved edits.
4. Rebuild every affected reachable row from the final spec, including all
   producers/carriers and the exact factory/result/consumer path.
5. Prove constructibility, consumer acceptance, identity/state continuity,
   terminal/recovery/side-effect consistency, and the distinguishing oracle.
6. Search the whole manifest for stale rules, contradictory outcomes, obsolete
   examples/tests, and the behavior the correction was meant to remove.
7. Reverse-trace each changed acceptance criterion to the canonical rule and
   forward-trace that rule to an observable test.

If the audit finds an edit-induced contradiction, missing row, or newly exposed
decision, repair or revert before reporting and repeat the entire audit. Never
leave it as a TODO, call the batch reconciled, or rely on the next review to
discover it. After interruption or uncertain audit evidence, treat edits as
unaudited and rerun this step.

### 6. Verify scope and stop

Before reporting, confirm:

- every edit belongs to a supplied confirmed finding;
- every confirmed edited root is closed across its task-owned surface;
- rejected or unverified claims caused no edit;
- no unresolved decision is hidden in changed prose;
- only authorized spec targets changed;
- no implementation, Git mutation, PR action, workflow change, or independent
  re-review occurred.

Then stop. The next owner reruns the failed review in a separate session.

## Response contract

Keep the response concise and include only applicable sections:

```text
Düzelttim:
- F1: <kökten kapanan kısa sonuç>

Değişiklik yapmadım:
- F2: <reddedilen iddia ve belirleyici kanıt>

Kanıt gerekiyor:
- F3: <eksik öncül ve bakılan sınır>

Karar gerekiyor:
- F4: <senaryo ve neden>
  Seçenekler: <gözlenebilir davranış + ana sonuçları>
  Önerim: <kanıta dayalı öneri>
  Soru: <tam olarak bir soru>

İzin gerekiyor:
- F5: <kesin dış hedef ve zorunluluk>

Doğrulama:
- Tam post-edit audit: <N> dosya yeniden okundu; <M> bağımsız kök yolu doğrulandı.
```

Include `Doğrulama` only after edits and a successful latest audit. `M` counts
independently failing task-owned paths, not clauses or files. Say “iş listesi
yerel olarak uzlaştırıldı” only when every item is `EDIT` with a completed audit
or `NO_CHANGE`; never say it while `EVIDENCE_REQUIRED`, `DECISION_REQUIRED`, or
`PERMISSION_REQUIRED` remains.

## Non-negotiable boundaries

- Do not add findings beyond the supplied closed worklist.
- Do not implement product code, tests, migrations, configuration, or runtime
  artifacts.
- Do not stage, commit, push, switch, restore, stash, merge, tag, create a
  worktree, open a PR, or start the next pipeline skill.
- Do not overwrite unrelated user changes or broaden task scope.
- Human approval is required for an unmade product/scope/public-contract
  decision and for any unavoidable write outside the named spec folder.
