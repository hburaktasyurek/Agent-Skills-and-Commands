---
name: goal-engineering
description: Turn a selected methodology and task contract into a compact, verifiable loop goal for any agent tool. Use after methodology selection when work needs an objective, evidence, boundaries, terminal conditions, fallback, and optional checker. Enforces a universal 4,000-character ceiling (or a stricter tool limit), reports the count, and fails instead of silently truncating.
---

# Goal Engineering

Render a goal from an already selected methodology. Do not choose the
methodology, execute the goal, or decide that the resulting loop is ready.

## Inputs

Read [references/input-contract.md](references/input-contract.md). The eight
shared fields are always explicit:

1. Methodology
2. Task
3. Audience
4. Context
5. Output Format
6. Validation
7. Method Fit
8. Human Review / Stop

The control envelope adds boundaries and fallback. Add smallest useful run,
checker, discovery, persistence, budget, or isolation only when the task makes
them applicable.

## Workflow

1. Confirm that methodology selection is complete. Do not repair or replace it.
2. Separate the measurable outcome from implementation steps.
3. Make validation evidence visible to the checker; a goal cannot rely on a
   checker reading evidence that the executing agent never surfaces.
4. Add boundaries before retry logic so a later attempt cannot redefine
   success.
5. Add explicit success, failure, no-progress, and human-return conditions.
6. Render with `scripts/render-goal.mjs`.
7. Report the exact character count and effective limit.
8. If the output exceeds the limit, return the overage and ask the caller to
   remove or rewrite optional context. Never truncate.

## Character budget

- Every target tool has a common ceiling of 4,000 Unicode characters.
- A supplied stricter tool limit wins.
- Aim for 3,500 characters or fewer to leave revision headroom.
- Preserve task, validation, boundaries, terminal conditions, and fallback
  before optional explanatory fields.
- Omit inapplicable optional sections; do not emit empty headings.

## Command

```bash
node scripts/render-goal.mjs path/to/input.json
```

Successful output is JSON containing `goal`, `character_count`, `limit`,
`within_limit`, `target_tool`, and `omitted_optional_fields`. An over-limit
render returns the same evidence and exits non-zero.

## Boundaries

- Do not select or reinterpret the methodology.
- Do not silently shorten user-provided requirements.
- Do not hide an over-limit result.
- Do not claim readiness.
- Do not execute, schedule, or persist the loop.

## Stop

Stop after one valid render or one explicit over-limit failure.

