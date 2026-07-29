# Selection record — skill-brief

Written **before** any `skills/skill-brief/SKILL.md` or `.skill-proposals/skill-brief/` draft.

No method name appeared in the selection request.

## Selector checklist

```yaml
purpose: >
  Produce a completed skill-path-selector checklist from skill-design intent.
  When checklist fields are incomplete, use grill-me under brief-owned bounds
  (field-scoped questions, one at a time, hard stop when the checklist is
  complete or blocked, default max 8 decision questions). Never invent field
  values. Do not select a create path, write SKILL.md, or ship.
audience: >
  Agents in the skill-design loop and humans reviewing the checklist before
  path selection.
when_to_use: >
  Skill design is starting and the skill-path-selector checklist is missing or
  incomplete; or skill-path-selector invokes skill-brief for intake.
when_not: >
  Checklist already complete; path selection; drafting or shipping a skill;
  post-ship behavior complaints (tune-skill); open-ended grilling unrelated to
  skill design.
success_signal: >
  Reviewer can see either (a) YAML with every required checklist field filled
  from conversation or marked unknown without invention, or (b) blocked with an
  explicit missing-field list; and grill-me was used only for missing fields
  under the stated bounds (or not used if nothing was missing).
boundaries: >
  Do not select methodology/decompose/procedural/blocked.
  Do not write .skill-proposals/ or skills/ SKILL.md.
  Do not run methodology-selector or skill-creator.
  Do not run unbounded grill-me; brief owns scope, question budget, and stop.
  Do not invent checklist values to force completeness.
context: >
  Repo skill-design loop: skill-path-selector calls skill-brief (not bare
  grill-me); skill-brief uses grill-me as a tool for its own gaps; then
  skill-creator drafts only after a path. Required checklist fields match
  skill-path-selector: purpose, audience, when_to_use, when_not,
  success_signal, boundaries, context, output_format, skill_name,
  skill_summary; optional invocation and replace.
output_format: >
  YAML checklist ready for skill-path-selector, or blocked with
  missing_fields list and optional open_questions for the human.
skill_name: skill-brief
skill_summary: >
  Fill the skill-path-selector checklist from skill-design intent, using
  bounded grill-me only for missing fields
invocation:
  - skill-brief
  - skill design brief
  - grill to checklist
```

## Eight-field input (mapped)

```yaml
task: >
  Produce a completed skill-path-selector checklist from skill-design intent.
  When checklist fields are incomplete, use grill-me under brief-owned bounds
  (field-scoped questions, one at a time, hard stop when the checklist is
  complete or blocked, default max 8 decision questions). Never invent field
  values. Do not select a create path, write SKILL.md, or ship.
audience: >
  Agents in the skill-design loop and humans reviewing the checklist before
  path selection.
context: >
  Repo skill-design loop: skill-path-selector calls skill-brief (not bare
  grill-me); skill-brief uses grill-me as a tool for its own gaps; then
  skill-creator drafts only after a path. Required checklist fields match
  skill-path-selector: purpose, audience, when_to_use, when_not,
  success_signal, boundaries, context, output_format, skill_name,
  skill_summary; optional invocation and replace. Map 5W2H coverage onto those
  checklist fields (what/why→purpose+skill_name+skill_summary+output_format;
  who→audience; where→context; when→when_to_use+when_not; how→boundaries and
  how grill-me is scoped; how much→question budget and effort/risk in
  success_signal or blocked notes).
output_format: >
  YAML checklist ready for skill-path-selector, or blocked with
  missing_fields list and optional open_questions for the human.
validation:
  checks:
    - Every required checklist field is present with a non-invented value or the
      run is blocked with an explicit missing_fields list
    - grill-me was invoked only for missing fields, one question at a time,
      within the question budget, and stopped when complete or blocked
  evidence:
    - Returned checklist YAML or blocked payload
    - Note whether grill-me ran and how many decision questions were asked
human_review_stop:
  stop_conditions:
    - Checklist complete and handed to skill-path-selector
    - Blocked on missing fields or human decisions
    - Question budget exhausted with remaining gaps → blocked
  human_approval_required: true
  approval_actions:
    - ship skill to skills/
```

## methodology-selector contract

```yaml
contract:
  methodology: five-w-two-h
  task: >
    Produce a completed skill-path-selector checklist from skill-design intent.
    When checklist fields are incomplete, use grill-me under brief-owned bounds
    (field-scoped questions, one at a time, hard stop when the checklist is
    complete or blocked, default max 8 decision questions). Never invent field
    values. Do not select a create path, write SKILL.md, or ship.
  audience: >
    Agents in the skill-design loop and humans reviewing the checklist before
    path selection.
  context: >
    Repo skill-design loop: skill-path-selector calls skill-brief (not bare
    grill-me); skill-brief uses grill-me as a tool for its own gaps; then
    skill-creator drafts only after a path. Required checklist fields match
    skill-path-selector: purpose, audience, when_to_use, when_not,
    success_signal, boundaries, context, output_format, skill_name,
    skill_summary; optional invocation and replace. Map 5W2H coverage onto those
    checklist fields (what/why→purpose+skill_name+skill_summary+output_format;
    who→audience; where→context; when→when_to_use+when_not; how→boundaries and
    how grill-me is scoped; how much→question budget and effort/risk in
    success_signal or blocked notes).
  output_format: >
    YAML checklist ready for skill-path-selector, or blocked with
    missing_fields list and optional open_questions for the human.
  validation:
    checks:
      - Every required checklist field is present with a non-invented value or the
        run is blocked with an explicit missing_fields list
      - grill-me was invoked only for missing fields, one question at a time,
        within the question budget, and stopped when complete or blocked
    evidence:
      - Returned checklist YAML or blocked payload
      - Note whether grill-me ran and how many decision questions were asked
  method_fit:
    best_when: A vague task needs a complete operating frame.
    avoid_when: The question is already narrow and only needs execution.
    reason: >
      The job is to turn vague skill-design intent into a complete fixed
      operating frame (the selector checklist). Catalog precedence allows 5W2H
      when that complete frame is the requested artifact. Negative fit does not
      apply while fields are missing; when_not covers the already-complete case.
  human_review_stop:
    stop_conditions:
      - Checklist complete and handed to skill-path-selector
      - Blocked on missing fields or human decisions
      - Question budget exhausted with remaining gaps → blocked
    human_approval_required: true
    approval_actions:
      - ship skill to skills/
selection:
  methodology_name: 5W2H
  reason: >
    Dominant stage need is completing an operating frame for skill design, not
    comparing paths (decision-matrix), measuring a finish goal (smart-goals),
    or cycling improvements (pdca).
  deferred_method: none
  method_ref: references/five-w-two-h.md
  quality_questions:
    - Are all seven questions answered?
    - Are assumptions marked?
    - Is ownership clear?
    - Is cost or effort visible?
```

## skill-path-selector path

`methodology` — checklist complete, no name collision, single responsibility,
honest method fit `five-w-two-h`.

Next: draft with methodology-skill-creator → `.skill-proposals/skill-brief/`.
