# 5 Whys

Source: [Loop Engineering Methodology Skill Generator](https://loopengineering.app/methodology-skill-generator/)

## Definition

Ask why repeatedly until the explanation moves from a symptom to a controllable
cause.

## Fit

- Best when a recurring issue needs a root-cause hypothesis before fixes begin.
- Avoid when multiple independent causes need broader analysis first.

## Principles

- Start from one observable failure.
- Require evidence for every causal step.
- Stop when the cause is controllable and actionable.
- Analyze the system, not personal blame.

## Steps

1. State the observed failure precisely.
2. Ask why it happened and attach evidence.
3. Ask why the preceding answer happened.
4. Continue only while each answer follows from the previous evidence.
5. Write a fix and a validation check.

## Quality questions

- Is the starting failure concrete and observable?
- Does each cause follow from the previous answer?
- Is the final cause something the team can change?
- Would the proposed validation catch this failure class again?

## Stop

Stop when the cause is actionable or evidence breaks the chain. Switch methods
when the issue separates into multiple independent causes. Stop and ask for
human help if the task does not fit 5 Whys, required context is missing, or
validation cannot be satisfied without guessing.
