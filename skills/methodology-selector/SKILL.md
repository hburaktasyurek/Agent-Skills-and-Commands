---
name: methodology-selector
description: Select one best-fit methodology from the canonical twelve-method catalog, or explicitly select none. Use before goal engineering or methodology-skill creation when a task needs a structured reasoning, communication, planning, improvement, or decision method. Returns positive fit, negative-fit veto, rationale, deferred method, and the canonical reference; it does not create skills, write goals, or perform the task.
---

# Methodology Selector

Choose the thinking method for the current stage of work. Do not perform the
work, create a skill, or write a loop goal.

## Input contract

Read these inputs from the user's request and current artifacts:

- **Task:** the work that needs a method.
- **Audience:** who will use or review the result.
- **Context:** facts and constraints that change the method choice.
- **Output format:** the requested artifact or decision shape.
- **Validation:** `checks` and `evidence` lists describing observable
  acceptance.
- **Human review / stop:** `stop_conditions`,
  `human_approval_required`, and `approval_actions`.

Do not invent a missing input if it could change the selected method. Name the
missing field and return `none` when selection would otherwise be guesswork.

## Selection procedure

1. Read [references/manifest.json](references/manifest.json) and
   [references/catalog.md](references/catalog.md).
2. Read the `Fit` sections of all twelve canonical references. Do not route
   from a hard-coded method summary in this skill.
3. Identify the task's dominant need for this stage, not every method that
   could eventually be useful.
4. Test each plausible candidate's positive fit against task evidence.
5. Test its negative fit. Negative fit vetoes keyword similarity.
6. When two methods could help, select the one that owns the current stage and
   list the other as deferred. Never blend two methods into an invented hybrid.
7. Select `none` when all candidates are vetoed, required evidence is missing,
   or the task is already narrow direct execution.
8. Read the selected reference in full and use its canonical quality questions.

## Output contract

Return exactly this structure. `contract` is the canonical eight-field handoff
to goal-engineering; copy the six input fields faithfully and add the selected
methodology plus method-fit evidence:

```yaml
contract:
  methodology: <exact slug from manifest.json or none>
  task: <input task, unchanged in meaning>
  audience: <input audience, unchanged in meaning>
  context: <input context, unchanged in meaning>
  output_format: <input output format, unchanged in meaning>
  validation:
    checks: <input checks, unchanged in meaning>
    evidence: <input evidence, unchanged in meaning>
  method_fit:
    best_when: <catalog fit or "Not applicable">
    avoid_when: <catalog negative fit or "Not applicable">
    reason: <task facts that establish the choice>
  human_review_stop:
    stop_conditions: <input stop conditions, unchanged in meaning>
    human_approval_required: <input boolean>
    approval_actions: <input actions, unchanged in meaning>
selection:
  methodology_name: <display name or "None">
  reason: <why this method owns the current stage>
  deferred_method: <methodology slug or none>
  method_ref: <relative reference path or none>
  quality_questions:
    - <question copied or faithfully adapted from the selected method reference>
```

When no secondary method owns a later stage, always return
`deferred_method: none`. For `none`, keep `quality_questions` empty and explain
which missing fact or negative-fit rule prevented selection. A `none` contract
must stop before goal-engineering.

## Boundaries

- Do not route by a methodology name appearing in the request.
- Do not choose a method because it is generally useful.
- Do not reproduce canonical method definitions or fit rules in this file.
- Do not convert method selection into task execution.
- Do not create or edit a methodology skill.
- Do not write a loop goal or readiness verdict.
- Do not select a slug absent from the manifest.

## Fixture validation

Run `node scripts/self-test.mjs` to verify manifest integrity, the six incoming
contract fields, exact slugs, must-not choices, deferred-method cases, and
positive plus negative-fit coverage for all twelve methods. The same check
validates the persisted per-case observations in
`evals/cold-routing-results.json` against the fixtures after expectations were
revealed. The persisted matrix records, but does not recreate, the independent
blinded routing review.

## Stop

Stop after one selection. If evidence is insufficient, return `none` with the
smallest missing input; do not interview indefinitely or guess.
