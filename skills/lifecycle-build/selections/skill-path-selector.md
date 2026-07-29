# Selection record — skill-path-selector

Written **before** any `skills/skill-path-selector/SKILL.md` existed.
No method name appeared in the selection request.

## Eight-field input

```yaml
task: >
  Choose one create path (methodology, decompose, procedural, or blocked) from
  a completed skill-design checklist using explicit criteria, including honest
  preference for a catalog methodology when fit is real, stopping on hybrid
  scope, and blocking on missing fields or name collision.
audience: Agents designing skills in this repository and humans reviewing the path.
context: >
  Checklist fields are already complete. Options are exactly four paths.
  Criteria include method fit, hybrid/multi-responsibility, missing facts,
  and name collision. Collision and missing fields are hard gates; remaining
  tradeoffs among methodology vs procedural vs decompose use explicit criteria.
  May invoke methodology-selector as a subroutine on the methodology branch.
output_format: >
  YAML with path, rationale, optional eight-field contract handoff, optional
  decompose list, optional procedural rationale, optional blocked reason.
validation:
  checks:
    - Path is exactly one of methodology | decompose | procedural | blocked
  evidence:
    - Rationale cites checklist facts and criteria or hard-gate evidence
human_review_stop:
  stop_conditions:
    - Stop after one path verdict
    - Stop when blocked requires human replace or missing checklist fields
  human_approval_required: true
  approval_actions:
    - ship skill to skills/
```

## Selection result

```yaml
contract:
  methodology: decision-matrix
  method_fit:
    best_when: Several options must be compared using explicit criteria.
    avoid_when: Taste or one hard constraint determines the choice.
    reason: >
      Four create paths must be compared with explicit criteria (method fit,
      hybrid scope, procedural narrowness). Hard gates (missing fields,
      collision) apply directly per Decision Matrix stop guidance; they do not
      veto the method for the remaining multi-criteria path choice.
selection:
  methodology_name: Decision Matrix
  reason: Owns the current stage of choosing among named options with criteria.
  deferred_method: none
  method_ref: references/decision-matrix.md
  quality_questions:
    - Were criteria chosen before scoring?
    - Are weights explained?
    - Does the recommendation match the scores?
    - Are close calls and caveats visible?
```

## Route

`methodology` → draft with methodology-skill-creator → `.skill-proposals/skill-path-selector/`
