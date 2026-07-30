---
name: skill-brief
description: "Apply 5W2H to fill the skill-path-selector checklist from skill-design intent, using bounded grill-me only for missing fields. Use when a vague task needs a complete operating frame. Triggers: skill-brief; skill design brief; grill to checklist."
---

# skill-brief

## Objective

Apply 5W2H (`five-w-two-h`) to this job: produce a completed skill-path-selector checklist from skill-design intent. When checklist fields are incomplete, use grill-me under brief-owned bounds (field-scoped questions, one at a time, hard stop when the checklist is complete or blocked, default max 8 decision questions). Never invent field values. Do not select a create path, write SKILL.md, or ship.

Produce the result for Agents in the skill-design loop and humans reviewing the checklist before path selection.

## Operating instructions

Repo skill-design loop: skill-design-loop applies skill-brief for intake (not
bare grill-me); skill-brief uses grill-me as a tool for its own gaps; then
skill-path-selector chooses a path and skill-draft-ship drafts only from the
complete handoff. Required checklist fields match skill-path-selector: purpose,
audience, when_to_use, when_not, success_signal, boundaries, context,
output_format, skill_name, skill_summary; optional invocation. Replacement
permission is `replace: none | proposal | shipped | both`, defaults to `none`,
and may only preserve explicit human authority naming the skill and target
kind. Map 5W2H coverage onto those checklist fields
(what/why→purpose+skill_name+skill_summary+output_format; who→audience;
where→context; when→when_to_use+when_not; how→boundaries and how grill-me is
scoped; how much→question budget and effort/risk in success_signal or blocked
notes).

## Required deliverable

YAML checklist ready for skill-path-selector, or blocked with missing_fields list and optional open_questions for the human.

## When to use

- Use when: skill design is starting and the skill-path-selector checklist is missing or incomplete; or skill-path-selector invokes skill-brief for intake. (5W2H fit: a vague skill-design intent needs a complete operating frame.)
- Do not use when: Checklist already complete; path selection; drafting or shipping a skill; post-ship behavior complaints (tune-skill); open-ended grilling unrelated to skill design; or the question is already narrow and only needs execution.
- Why 5W2H: The job is to turn vague skill-design intent into a complete fixed operating frame (the selector checklist). Catalog precedence allows 5W2H when that complete frame is the requested artifact.

## Invocation

- skill-brief
- skill design brief
- grill to checklist

## Workflow

Apply this 5W2H procedure while executing the job:

## Definition

Frame a problem by answering what, why, who, where, when, how, and how much.


## Principles

- Cover the whole situation before choosing a fix.
- Separate observed facts from assumptions.
- Make ownership and timing explicit.
- Surface cost or effort early.

## Steps

1. Define what is happening.
2. Explain why it matters.
3. Name who is involved.
4. Clarify where and when it occurs.
5. Describe how it should be handled.
6. Estimate how much time, cost, effort, or risk is involved.

## Quality questions

- Are all seven questions answered?
- Are assumptions marked?
- Is ownership clear?
- Is cost or effort visible?

## Stop

Stop when the operating frame is complete. Choose direct execution instead
when the task was already narrow. Stop and ask for human help if the task does
not fit 5W2H, required context is missing, or validation cannot be satisfied
without guessing.

## Execution checks

- Every required checklist field is present with a non-invented value or the run is blocked with an explicit missing_fields list
- grill-me was invoked only for missing fields, one question at a time, within the question budget, and stopped when complete or blocked

## Evidence to return

- Returned checklist YAML or blocked payload
- Note whether grill-me ran and how many decision questions were asked

## Human review and stop

- Checklist complete and handed to skill-path-selector
- Blocked on missing fields or human decisions
- Question budget exhausted with remaining gaps → blocked

Human approval is required before: ship skill to skills/.

## Boundaries

- Apply only 5W2H; do not blend another methodology.
- Do not select a create path (methodology | decompose | procedural | blocked).
- Do not write `.skill-proposals/` or `skills/` SKILL.md files.
- Do not run methodology-selector, skill-draft-ship, skill-review, or ship.
- Do not run unbounded grill-me; brief owns field scope, one-at-a-time questions, default max 8 decision questions, and stop.
- Do not invent checklist values to force completeness; mark unknown and block instead.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
