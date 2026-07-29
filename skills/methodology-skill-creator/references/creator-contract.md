# Methodology Skill Creator Contract

## Input

```json
{
  "skill_name": "bounded-skill-name",
  "skill_summary": "Short outcome-only phrase for discovery.",
  "invocation": ["optional alias", "..."],
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

Discovery fields sit outside the eight-field contract.

Contract checklist (exact):

1. `skill_summary` required
2. description formula uses skill_summary not task
3. Triggers suffix max 3
4. `## Invocation` holds full alias list
5. Fit stripped; When to use is fit surface
6. summary ≤ 160; description ≤ 400; alias ≤ 48
7. newline rejected; whitespace normalized
8. `decapitalizeForGlue` on summary and best_when before description glue
9. nested Apply-formula reject only for `Apply {manifest display name} to …`
10. limit failures throw before checks; no new CREATOR_CHECKS keys

`invocation` is optional. When present it must be a non-empty string list.
Aliases beyond the first three appear only under `## Invocation`.

## Description discovery boundary

Frontmatter `description` is cold discovery only:

```text
Apply {MethodologyDisplayName} to {skill_summary}. Use when {best_when}.
```

When `invocation` is non-empty, append:

```text
 Triggers: {alias1}; {alias2}; {alias3}.
```

Normalize `skill_summary`, `best_when`, and each alias: trim; collapse internal
whitespace to a single space; strip a trailing `.`; reject any newline.
Then apply `decapitalizeForGlue`: lowercase the first character unless the
string starts with an acronym (`/^[A-Z]{2,}([^a-z]|$)/`).
Reject `skill_summary` only when it starts with
`Apply {MethodologyDisplayName} to …` for a display name from the methodology
manifest (case-insensitive). Ordinary English such as
`apply closed purpose-fail remedies to a skill draft` must render.

Limits:

- summary ≤ 160; description ≤ 400; alias ≤ 48
- newline rejected; whitespace normalized
- limit failures throw before checks; no new CREATOR_CHECKS keys

Description must not contain `audience`, the boilerplate
`Follow the embedded method, validation, and human-stop rules.`, the full
`contract.task`, or validation/stop lists.

## Body runtime boundary

The eight fields stay in the body. Fit stripped; When to use is fit surface.
Workflow inlines the canonical method with the `## Fit` block removed.
Definition, Principles, Steps, Quality questions, and Stop remain.

Body order: Objective → Operating instructions → Required deliverable →
When to use → Invocation (if present) → Workflow → Execution checks →
Evidence to return → Human review and stop → Boundaries.

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
