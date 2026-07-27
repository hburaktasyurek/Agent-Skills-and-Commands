# Goal Input Contract

## Eight shared fields

```json
{
  "methodology": "Exact slug from methodology-selector/references/manifest.json",
  "task": "Outcome the loop must complete",
  "audience": "Who uses or reviews the result",
  "context": "Only facts and constraints that change execution",
  "output_format": "Required artifact or response shape",
  "validation": {
    "checks": ["Observable command, test, score, or checklist"],
    "evidence": ["Evidence the agent must surface"]
  },
  "method_fit": {
    "best_when": "Positive-fit rule",
    "avoid_when": "Negative-fit rule",
    "reason": "Current task evidence supporting selection"
  },
  "human_review_stop": {
    "stop_conditions": ["Success, failure, or no-progress condition"],
    "human_approval_required": true,
    "approval_actions": ["merge", "deploy"]
  }
}
```

## Control envelope

Required:

- `boundaries`: non-empty list of forbidden shortcuts or scope limits.
- `fallback`: what to preserve and report when blocked.

Conditional:

- `hypothesis`: what the loop is trying to prove or learn.
- `smallest_useful_run`: new, broad, or high-risk loops.
- `independent_checker`: mutating, high-risk, or subjective work.
- `discovery_source`: work discovered from changing state.
- `persistence`: repeated or resumable work.
- `budget`: long-running, repeated, scheduled, or paid work.
- `isolation`: mutating or parallel work.
- `target_tool`: output label; defaults to `generic`.
- `target_limit`: only when the target is stricter than 4,000 characters.

Fields are omitted only when they are inapplicable. Character pressure is not
permission to remove a mandatory gate or silently rewrite the caller's meaning.
When `human_approval_required` is `false`, `approval_actions` must be absent or
an empty list; contradictory approval data fails instead of being discarded.
