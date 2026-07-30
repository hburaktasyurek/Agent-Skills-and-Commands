---
name: skill-path-selector
description: "Apply Decision Matrix to choose one skill-create path from a completed checklist. Use when several options must be compared using explicit criteria. Triggers: select skill path; skill-path-selector."
---

# skill-path-selector

## Objective

Apply Decision Matrix (`decision-matrix`) to this job: choose one create path (methodology, decompose, procedural, or blocked) from a completed skill-design checklist using explicit criteria, including honest preference for a catalog methodology when fit is real, stopping on hybrid scope, and blocking on missing fields or name collision.

Produce the result for Agents designing skills in this repository and humans reviewing the path.

## Operating instructions

If the skill-design checklist is missing or incomplete, invoke `skill-brief`
first (it may use `grill-me` under brief-owned bounds). Do not call bare
`grill-me` from this skill. Require checklist fields: purpose, audience,
when_to_use, when_not, success_signal, boundaries, context, output_format,
skill_name, skill_summary; optional invocation. Normalize replacement
permission to `replace: none | proposal | shipped | both`, defaulting to
`none`; never infer authority. Hard gates: missing field or a proposal/shipped
collision not covered by that exact permission → blocked. `proposal` covers
only a proposal, `shipped` only a shipped name, and `both` covers both.
Options: methodology, decompose, procedural, blocked. Criteria before scoring:
(1) checklist completeness, (2) collision, (3) hybrid/multi-responsibility,
(4) honest catalog method fit via methodology-selector without method-name
bias, (5) narrow procedure when no method fits. Map checklist to eight fields
when invoking methodology-selector. Preserve deferred_method; never blend
methods. Do not write SKILL.md files.

## Required deliverable

YAML with path, rationale, optional contract/selection handoff, optional smaller_skills for decompose, optional procedural_rationale, optional missing_or_collision.

## When to use

- Use when: several options must be compared using explicit criteria
- Do not use when: Taste or one hard constraint determines the choice.
- Why Decision Matrix: Four create paths compared with explicit criteria; hard gates applied directly.

## Invocation

- select skill path
- skill-path-selector

## Workflow

Apply this Decision Matrix procedure while executing the job:

## Definition

Score options against weighted criteria so tradeoffs are visible before a
choice is made.


## Principles

- Name the options.
- Choose criteria before scoring.
- Weight criteria by importance.
- Explain the recommendation, not only the score.

## Steps

1. List the options.
2. Define the criteria.
3. Set the weights.
4. Score each option.
5. Recommend one option with caveats.

## Quality questions

- Were criteria chosen before scoring?
- Are weights explained?
- Does the recommendation match the scores?
- Are close calls and caveats visible?

## Stop

Stop after the tradeoff and recommendation are visible. Apply the hard
constraint directly when scoring would add no information. Stop and ask for
human help if the task does not fit Decision Matrix, required context is
missing, or validation cannot be satisfied without guessing.

## Execution checks

- Path is exactly one of methodology | decompose | procedural | blocked

## Evidence to return

- Rationale cites checklist facts and criteria or hard-gate evidence

## Human review and stop

- Stop after one path verdict
- Stop when blocked requires target-specific human replacement authority or
  missing checklist fields

Human approval is required before: ship skill to skills/.

## Boundaries

- Apply only Decision Matrix; do not blend another methodology.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
