---
name: loop-readiness-score
description: Score a rendered loop goal against eleven weighted readiness criteria totaling 100, then return blocked, supervised, or ready with evidence. Use after goal-engineering and before any autonomous, repeated, scheduled, or mutating run. Hard safety gates override the numeric score; the skill independently rerenders and recounts the goal but never repairs or executes it.
---

# Loop Readiness Score

Evaluate a completed goal contract. Do not select a methodology, rewrite the
goal, run the task, or turn a score into permission.

## Input

Read [references/readiness-contract.md](references/readiness-contract.md). Use
the goal renderer's `goal_result` as authoritative character evidence and the
structured `goal_input` contract for control checks. The checker rerenders
`goal_input` and requires an exact match with the supplied goal; metadata that
never reached the executable goal cannot satisfy readiness.

The eleven answers are `no`, `partial`, or `yes`. Each earns zero, half, or all
of its criterion weight. Weights total 100. The score communicates maturity;
it cannot average away a hard safety failure.

Use the live four-band model: 0–39 `Not ready`, 40–59
`Manual supervision required`, 60–79
`Semi-autonomous loop candidate`, and 80–100 `Strong loop candidate`.
Round the weighted total once with `Math.round` before choosing the band or
applying the 80-point threshold. The band describes maturity; the separate
verdict still applies hard and supervision gates.

## Hard gates

Return `blocked` when any of these is missing or false:

- a specific task outcome;
- validation checks and evidence;
- explicit boundaries;
- at least one stop condition;
- fallback behavior;
- a generated goal within its effective character limit;
- an exact rerender match between the canonical input and executable goal;
- explicit risk and applicability declarations;
- human approval when the contract says approval is required.

Numeric coverage can never compensate for a failed hard gate.

## Supervision gates

When hard gates pass, return `supervised` if an applicable control is absent:

- independent checker for medium/high-risk work;
- smallest useful run for a broad or high-risk task;
- budget for long-running or repeated work;
- isolation for mutating work;
- persistence for repeated or resumable work;
- explicit method-fit evidence.

Return `ready` only when hard and applicable supervision gates pass.

## Command

```bash
node scripts/check-readiness-score.mjs path/to/readiness-input.json
```

The result contains `score`, `max_score`, `score_band`, the eleven criterion
results, verdict, hard-gate evidence, supervision-gate evidence, and the single
recommended next correction. `blocked` exits 2, `supervised` exits 3, and
`ready` exits 0.

## Boundaries

- Do not modify the goal.
- Do not infer that a missing gate probably exists elsewhere.
- Do not average away a hard failure.
- Do not authorize execution, merge, deploy, deletion, purchase, or external
  communication.

## Stop

Stop after one verdict. Route corrections back to goal-engineering or the human
who owns the missing scope decision.
