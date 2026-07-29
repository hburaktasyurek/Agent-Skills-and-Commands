# Methodology Skill Creator Contract

## Input

```json
{
  "skill_name": "bounded-skill-name",
  "contract": {
    "methodology": "Exact slug from methodology-selector/references/manifest.json",
    "task": "Task outcome",
    "audience": "Users and reviewers",
    "context": "Execution-changing facts",
    "output_format": "Required result shape",
    "validation": {
      "checks": ["Observable check"],
      "evidence": ["Evidence to surface"]
    },
    "method_fit": {
      "best_when": "Positive fit",
      "avoid_when": "Negative fit",
      "reason": "Current task evidence"
    },
    "human_review_stop": {
      "stop_conditions": ["Terminal condition"],
      "human_approval_required": true,
      "approval_actions": ["publishing"]
    }
  },
  "selection": {
    "methodology_name": "Display name",
    "method_ref": "references/<canonical-method>.md"
  }
}
```

The `contract` must be the canonical handoff from methodology-selector.
`method_ref` must match the selected slug; callers cannot inject an arbitrary
file.

## Output

The renderer returns:

- `skill_name`;
- `methodology`;
- `method_ref`;
- `files`, containing exactly one proposed `SKILL.md`;
- `character_count`;
- `checks`, showing frontmatter, eight-field preservation, one-method scope,
  operational runtime structure, validation, canonical method sections
  including quality questions, and human-return coverage.

The proposed `SKILL.md` renders the preserved fields as direct runtime
instructions. It must not expose the handoff as an `Assignment contract` report
with `Task`, `Audience`, or `Context` labels.

`character_count` is informational. Methodology skills have no 4,000-character
hard limit; they should remain focused and may use references when detail grows.
Only generated loop goals are subject to the universal 4,000-character limit.

The renderer proposes content but does not write files.
