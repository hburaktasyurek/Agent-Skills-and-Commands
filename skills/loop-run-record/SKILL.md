---
name: loop-run-record
description: Turn externally supplied evidence from one completed loop run into a canonical, review-required record bound to the exact goal and readiness assessment. Use after a ready goal has been run elsewhere and evidence must be preserved for stop, adjustment, or human action. Never executes, retries, schedules, or changes a goal or skill.
---

# Loop Run Record

Record what happened in one externally executed run. This skill is a
post-run evidence boundary, not an executor or a new readiness judge.

## Preconditions

Read [references/run-record-contract.md](references/run-record-contract.md).

- Goal input, rendered goal, readiness input, and readiness result must be the
  exact artifacts that produced a `ready` verdict.
- The observation must contain one result for every validation check.
- Actual evidence, hypothesis outcome, feedback, next action, and a
  human-return reason must be explicit.

Stop on stale, forged, incomplete, blocked, or supervised artifacts. Do not
repair them.

## Workflow

1. Reassess the supplied goal with the supplied readiness envelope.
2. Require the fresh assessment to match the supplied result and identity.
3. Match each observed check to one canonical validation check.
4. Derive `yes`, `partial`, or `no` from check statuses; do not trust a
   caller-supplied overall result.
5. Bind expected evidence, actual evidence, hypothesis outcome, feedback, next
   action, and human-return reason into one deterministic record.
6. Return the record with `review-required`.

```bash
node scripts/create-run-record.mjs path/to/input.json
```

## Boundaries

- Do not execute, retry, resume, schedule, or monitor a task.
- Do not modify the goal, readiness result, methodology, skill, or evidence.
- Do not claim that a record authorizes commit, merge, deploy, publication, or
  another run.
- Do not create memory or update a playbook automatically.
- Do not accept blocked or supervised readiness as evidence that a run was
  permitted.

## Stop

Stop after one canonical record or one explicit validation failure. Return the
record to a human for the next decision.
