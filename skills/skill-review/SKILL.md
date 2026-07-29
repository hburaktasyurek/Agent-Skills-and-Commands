---
name: skill-review
description: "Apply SMART Goals to judge whether a skill draft achieves its stated purpose. Use when a goal must become measurable enough for an agent or person to finish. Triggers: skill-review; purpose review draft."
---

# skill-review

## Objective

Apply SMART Goals (`smart-goals`) to this job: judge whether a skill draft under .skill-proposals achieves its stated purpose; return purpose_pass or purpose_fail with a closed remedy list; edit nothing. Treat the draft objective as the outcome under test and require reviewer-checkable success evidence, concrete boundaries, and a human approval gate the executing agent does not self-approve.

Produce the result for Agents in a separate review session and humans deciding whether to ship.

## Operating instructions

Accept only paths under .skill-proposals/<skill_name>/. Reject skills/ paths; post-ship complaints use tune-skill. Require checklist purpose, success_signal, boundaries, when_not. Answer four purpose questions yes/no with draft quotes: (1) pursues checklist purpose only; (2) success_signal reviewer-checkable in Validation; (3) concrete forbid from boundaries/when_not; (4) executing agent is not sole approver of purpose success. All yes → purpose_pass; any no → purpose_fail with closed remedies F1.. for revise-skill-from-review.

## Required deliverable

YAML verdict with draft_path, per-question evidence, and remedies on fail.

## When to use

- Use when: a goal must become measurable enough for an agent or person to finish
- Do not use when: The work is still exploratory and no honest success condition can yet be named.
- Why SMART Goals: Draft judged as goal-shaped instructions for measurable finishability.

## Invocation

- skill-review
- purpose review draft

## Workflow

Apply this SMART Goals procedure while executing the job:

## Definition

Turn an intention into a specific, measurable, achievable, relevant, and
bounded outcome.


## Principles

- Name the outcome rather than a list of activities.
- Define observable measurement or validation evidence.
- Keep the scope achievable.
- Connect the goal to a real reason.
- Add a time, iteration, or stop boundary.

## Steps

1. Rewrite the intention as a specific outcome.
2. Add the measurement and expected evidence.
3. Check that the scope is achievable in the intended run.
4. State why the outcome matters to the audience.
5. Add a deadline, iteration cap, or stop rule.

## Quality questions

- Is the goal outcome-based?
- Can a reviewer determine objectively when it is done?
- Is the scope achievable in the intended run?
- Is there a real boundary that stops the work?

## Stop

Stop when the outcome is measurable and bounded. Return to discovery instead of
inventing a metric when success is not yet knowable. Stop and ask for human
help if the task does not fit SMART Goals, required context is missing, or
validation cannot be satisfied without guessing.

## Execution checks

- All four purpose questions answered yes or no with quotes from the draft

## Evidence to return

- purpose_pass or purpose_fail with closed remedy list on fail

## Human review and stop

- Stop after one verdict

Human approval is required before: ship skill to skills/.

## Boundaries

- Apply only SMART Goals; do not blend another methodology.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
