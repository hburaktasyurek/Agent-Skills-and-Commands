# Readiness Score Input and Verdict Contract

## Input

```json
{
  "goal_input": {
    "methodology": "work-breakdown-structure",
    "hypothesis": "What the loop is trying to prove or learn",
    "task": "Specific outcome",
    "audience": "Users and reviewers",
    "context": "Execution-changing facts",
    "output_format": "Required artifact",
    "validation": {
      "checks": ["Observable checks"],
      "evidence": ["Evidence the agent must surface"]
    },
    "method_fit": {
      "best_when": "Positive fit",
      "avoid_when": "Negative fit",
      "reason": "Task evidence supporting the method"
    },
    "human_review_stop": {
      "stop_conditions": ["Terminal conditions"],
      "human_approval_required": true,
      "approval_actions": ["merge"]
    },
    "boundaries": ["Forbidden shortcuts"],
    "fallback": "Blocked-run behavior"
  },
  "goal_result": {
    "goal": "Rendered goal text",
    "character_count": 3200,
    "limit": 4000,
    "within_limit": true
  },
  "readiness_answers": {
    "hypothesis": "yes",
    "smallest_useful_run": "yes",
    "goal_clarity": "yes",
    "validation": "yes",
    "independent_checker": "yes",
    "boundaries": "yes",
    "stop_condition": "yes",
    "budget_limit": "yes",
    "rollback_strategy": "yes",
    "sandbox_isolation": "yes",
    "human_approval_gate": "yes"
  },
  "risk_level": "low | medium | high",
  "mutates": true,
  "repeated": true,
  "broad": true,
  "long_running": false,
  "resumable": true,
  "scheduled": false
}
```

`risk_level`, `human_approval_required`, and all six applicability flags are
required declarations. Use explicit `false` when a condition does not apply;
absence is unknown, not false, and blocks readiness.

Every readiness answer is required and must be `no`, `partial`, or `yes`.
Answers earn zero, half, or all of these weights:

| Criterion | Weight |
|---|---:|
| Hypothesis | 8 |
| Smallest useful run | 8 |
| Goal clarity | 10 |
| Validation | 14 |
| Independent checker | 12 |
| Boundaries | 10 |
| Stop condition | 10 |
| Budget limit | 8 |
| Rollback strategy | 7 |
| Sandbox isolation | 6 |
| Human approval gate | 7 |

The total is 100. Scores 0–39 are `Not ready`, 40–59 are
`Manual supervision required`, 60–79 are
`Semi-autonomous loop candidate`, and 80–100 are
`Strong loop candidate`. Sum the per-criterion earned values, then round the
total once with `Math.round` before choosing the band or applying the 80-point
readiness threshold. A partial or yes answer
without corresponding structured source evidence hard-blocks the result.

`goal_input` is the canonical eight-field contract plus its control envelope.
The checker rerenders it and requires the complete `goal_result` object,
including `target_tool` and `omitted_optional_fields`, to match exactly.
Complete or forged metadata beside a detached executable goal cannot produce
`ready`.

When `scheduled` is `true`, `human_approval_required` must be true and
`approval_actions` must include the exact canonical action
`activate or change a schedule`. An unrelated approval such as commit or
publish does not satisfy the scheduling gate.

## Verdicts

- `blocked`: at least one hard gate fails.
- `supervised`: hard gates pass, but at least one applicable supervision gate
  is missing.
- `ready`: every hard and applicable supervision gate passes.

Hard gates override the numeric score. The verdict and score are evidence about
controls, not permission to perform an external or irreversible action.
The single recommended correction follows the verdict blocker: a hard gate
first; when the score is already 80 or higher, the first failed supervision
gate; otherwise the weakest weighted criterion needed to improve the score.
A `ready` verdict has no blocker and returns
`No readiness correction required.`

The result includes a deterministic `assessment_id` bound to the exact goal,
answers, declarations, gates, score, and verdict. A later run record must
rerun the assessment and reject a detached or stale identity.
