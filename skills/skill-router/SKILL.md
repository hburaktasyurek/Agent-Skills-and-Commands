---
name: skill-router
description: "Apply Decision Matrix to recommend exactly one catalog skill for a job, or none/blocked with evidence. Use when several options must be compared using explicit criteria. Triggers: skill-router; which skill; route skill."
---

# skill-router

## Objective

Apply Decision Matrix (`decision-matrix`) to this job: recommend exactly one INDEX-listed catalog skill for a required job using INDEX and SKILL.md fit evidence, or none when zero or multiple fit, or blocked when job/catalog is unusable; never recommend skill-router; never propose chains or execute the skill.

Produce the result for Agents unsure which catalog skill to run; humans checking the pick.

## Operating instructions

Catalog membership requires INDEX listing and skills/<name>/SKILL.md in the workspace. Ignore .skill-proposals and global installs. Hard gates before scoring: empty job or missing INDEX/skills root → blocked; apply exclude filter; remove skill-router from candidates. Criteria: (1) description / when-to-use positive fit to job, (2) when-not / boundaries negative fit, (3) single-responsibility match (hybrid jobs that need two skills → none). If zero remain or two+ tie for best → none with near_misses. Exactly one clear winner → skill + rationale citing catalog evidence. near_misses are evidence only — do not execute as a sequence.

## Required deliverable

YAML primary verdict skill|none|blocked with rationale, near_misses, or missing fields as applicable.

## When to use

- Use when: caller has a job description and needs one catalog skill recommendation, or an honest none/blocked. (Decision Matrix fit: several catalog options compared with explicit criteria.)
- Do not use when: Caller wants a WORKFLOW chain; designing a new skill (skill-path-selector / skill-brief); selecting a thinking methodology only (methodology-selector); executing or installing a skill; post-ship tune; or taste / one hard constraint already determines the choice without catalog compare.
- Why Decision Matrix: Many catalog skills are options; fit uses explicit criteria and hard gates. Hard constraints (empty job, missing catalog, self-exclusion) apply directly without scoring; remaining choice is multi-option compare.

## Invocation

- skill-router
- which skill
- route skill

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

- Primary verdict is exactly one of skill, none, blocked
- Recommended names are in INDEX and have skills/<name>/SKILL.md
- skill-router never selected
- Ties and hybrids return none with near_misses, not an arbitrary winner

## Evidence to return

- Returned YAML verdict
- Catalog evidence cited for skill or near_misses

## Human review and stop

- One primary verdict returned
- Blocked when job or catalog unusable

Human approval is required before: ship skill to skills/.

## Boundaries

- Apply only Decision Matrix; do not blend another methodology.
- Do not invent skill names outside INDEX ∩ workspace `skills/<name>/SKILL.md`.
- Do not recommend `skill-router` (self-exclusion).
- Do not propose ordered skill chains; do not execute `near_misses` as a sequence.
- Do not write, edit, commit, push, or `npx skills` install.
- Do not use global/`npx` installs as catalog source of truth.
- Do not arbitrarily pick a winner on ties or hybrids — return `none` + `near_misses`.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
