# Loop Orchestrator Handoff Contract

Every handoff returns:

```yaml
intent: loop-goal | methodology-skill | record-run
stage: selection | goal-render | readiness | skill-creation | run-record
status: none | failed | blocked | supervised | ready | review-required
canonical_contract: <the unchanged eight-field contract or null>
artifact: <component output or null>
evidence:
  - <character count, verdict gate, renderer check, or selection evidence>
failed_hard_gates: <failed hard-gate records for a goal handoff>
failed_supervision_gates: <failed supervision-gate records for a goal handoff>
recommended_next_correction: <single readiness correction for a goal handoff>
next_owner: methodology-selector | goal-engineering | loop-readiness-score | methodology-skill-creator | human | none
```

## Handoff invariants

- `canonical_contract` is created only by methodology-selector and never
  silently rewritten.
- `none` always has `next_owner: human | none`, never goal-engineering.
- `goal_result` and `goal_input` travel together into readiness.
- The terminal handoff reruns readiness with the exact `goal_input`,
  `goal_result`, answers, risk, and applicability envelope; detached or stale
  readiness evidence is rejected.
- A terminal goal handoff requires exact character evidence, the selected
  methodology in the rendered goal, all eleven score criteria, and explicit
  hard plus supervision gate evidence. Its verdict must agree with those
  gates.
- `blocked` and `supervised` never become `ready` through orchestration.
- `record-run` preserves `blocked` and `supervised` terminal states without
  creating a record. Only an exact `ready` assessment plus complete external
  observations reaches loop-run-record.
- Goal handoffs retain the full goal and readiness artifacts, failed hard and
  supervision gates, score band, and the single recommended correction.
- `ready` means the goal contract passed readiness, not that execution or an
  external action was authorized.
- Creator output must match the selected methodology and canonical reference,
  contain exactly one counted SKILL.md, and pass every creator check before it
  receives `status: review-required`.
- Only the component that owns a failed field may correct it.
- A run record remains `review-required`; orchestration never converts it into
  execution, retry, scheduling, memory, or approval.

`scripts/handoff-core.mjs` enforces exact deep equality across the eight fields
and validates downstream artifact and gate evidence without reproducing method
selection, goal rendering, or readiness scoring.
