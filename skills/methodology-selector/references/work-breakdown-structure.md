# Work Breakdown Structure

Source: [Loop Engineering Methodology Skill Generator](https://loopengineering.app/methodology-skill-generator/)

## Definition

Decompose a large deliverable into smaller work packages that can be owned,
ordered, and validated independently.

## Fit

- Best when a large body of work cannot be implemented or reviewed safely as
  one unit.
- Avoid when the task is already small enough for one bounded run.

## Principles

- Decompose by deliverable, not by vague activity.
- Keep every work package independently reviewable.
- Separate outcomes from the actions used to produce them.
- Give each package validation and dependency information.

## Steps

1. Name the final deliverable.
2. Split it into major deliverables with non-overlapping responsibilities.
3. Split each major deliverable into bounded work packages.
4. Add ownership, validation, and dependency notes to each package.
5. Identify which work package should run first.

## Quality questions

- Are the parts deliverables rather than vague activities?
- Can every package be reviewed independently?
- Does every package have observable validation?
- Are dependencies and the first integration slice visible?

## Stop

Stop when every package is bounded, reviewable, validated, and ordered. Do not
keep decomposing work already small enough to execute. Stop and ask for human
help if the task does not fit Work Breakdown Structure, required context is
missing, or validation cannot be satisfied without guessing.
