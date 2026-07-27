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
- `execution_handoff`: who implements, who independently checks, and which
  actions remain human-owned for broad or mutating work.
- `persistence`: repeated or resumable work.
- `schedule_policy`: when or whether the loop may be scheduled.
- `budget`: long-running, repeated, scheduled, or paid work.
- `max_iterations`: positive integer cap when retries are possible.
- `isolation`: mutating or parallel work.
- `feedback_prompt`: evidence-based post-run question that informs stop,
  adjustment, or human return.
- `target_tool`: output label; defaults to `generic` only when the property is
  absent.
- `target_limit`: only when the target is stricter than 4,000 characters.

Omit an optional property entirely when it is inapplicable. When an optional
string property is present, it must be a non-empty string; an empty, null, or
non-string value fails instead of being silently classified as omitted.
Character pressure is not permission to remove a mandatory gate or silently
rewrite the caller's meaning.
When `human_approval_required` is `false`, `approval_actions` must be absent or
an empty list; contradictory approval data fails instead of being discarded.
When the readiness applicability declaration will set `scheduled: true`,
`approval_actions` must include the exact action
`activate or change a schedule`; unrelated commit or publish approval is not
scheduling approval.
