---
name: revise-skill-from-review
description: "Apply PDCA to apply closed purpose-fail remedies to a skill draft. Use when a workflow should improve through repeated measured cycles. Triggers: revise-skill-from-review; revise skill draft."
---

# revise-skill-from-review

## Objective

Apply PDCA (`pdca`) to this job: apply a closed purpose_fail remedy list to a skill draft under .skill-proposals only; verify each gap; make the smallest in-scope edits; leave re-review to a separate session; do not invent findings or ship.

Produce the result for Agents in the skill-design authoring session and humans.

## Operating instructions

Plan: lock draft path and closed remedies. Do: edit only .skill-proposals/<skill_name>/. Check: reconcile each remedy ID. Act: hand to separate skill-review; do not claim re-review passed. Never edit skills/, INDEX, README; never commit/push/install. Do not expand purpose beyond checklist.

## Required deliverable

Per-remedy reconciliation summary and updated draft files when confirmed.

## When to use

- Use when: a workflow should improve through repeated measured cycles
- Do not use when: The task is a one-off decision with no next cycle.
- Why PDCA: Create-loop supplies re-review as next cycle after this bounded change.

## Invocation

- revise-skill-from-review
- revise skill draft

## Workflow

Apply this PDCA procedure while executing the job:

## Definition

Improve a process by planning a change, running it on a small scale, checking
the evidence, and acting on what was learned.


## Principles

- Keep the planned change small enough to test.
- Run it within a fixed boundary.
- Compare the result with the expectation.
- Standardize, adjust, or stop before the next cycle.

## Steps

1. Plan the smallest useful change.
2. Do one bounded run.
3. Check the evidence against the hypothesis.
4. Act by keeping, changing, or stopping the loop.

## Quality questions

- Was the change small enough to evaluate?
- Was the result measured?
- Is the next action based on evidence?
- Did scope remain fixed during the run?

## Stop

Stop after the check-and-act decision. Do not manufacture a next cycle for a
one-off task. Stop and ask for human help if the task does not fit PDCA,
required context is missing, or validation cannot be satisfied without
guessing.

## Execution checks

- Every remedy is confirmed, edited, pushed back, or blocked with reason

## Evidence to return

- Diffs limited to .skill-proposals/<skill_name>/

## Human review and stop

- Stop when the closed list is reconciled or an item needs human input

Human approval is required before: ship skill to skills/.

## Boundaries

- Apply only PDCA; do not blend another methodology.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
