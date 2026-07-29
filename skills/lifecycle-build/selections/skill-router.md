# Selection record — skill-router

Written **before** any `skills/skill-router/SKILL.md` or `.skill-proposals/skill-router/` draft.
No method name appeared in the selection request.

## Selector checklist

```yaml
purpose: >
  Recommend exactly one INDEX-listed catalog skill for a required job using
  INDEX and SKILL.md fit evidence, or none when zero or multiple fit, or
  blocked when job/catalog is unusable; never recommend skill-router; never
  propose chains or execute the skill.
audience: Agents unsure which catalog skill to run; humans checking the pick.
when_to_use: >
  Caller has a job description and needs one catalog skill recommendation
  (or an honest none/blocked).
when_not: >
  Caller wants a WORKFLOW chain; designing a new skill (use skill-path-selector /
  skill-brief); selecting a thinking methodology only (methodology-selector);
  executing or installing a skill; post-ship tune.
success_signal: >
  Primary verdict is exactly one of skill|none|blocked per plan rules; skill
  names are INDEX∩SKILL.md only; self-exclusion held; ties yield none +
  near_misses (not a chain); S1–S3 smokes match expected primaries.
boundaries: >
  Do not invent skill names outside catalog.
  Do not recommend skill-router.
  Do not propose ordered chains or execute near_misses as a sequence.
  Do not write/edit/install skills.
  Do not use global npx installs as catalog SoT.
  Catalog = INDEX entry AND skills/<name>/SKILL.md in workspace.
context: >
  Repo skill kit; INDEX.md is curated list; descriptions drive discovery.
  Input: required job; optional exclude list. Tie/hybrid → none + near_misses.
  Blocked = missing job or unreadable catalog.
output_format: >
  YAML with primary verdict skill|none|blocked; rationale or near_misses or
  missing as specified.
skill_name: skill-router
skill_summary: >
  Recommend exactly one catalog skill for a job, or none/blocked with evidence
invocation:
  - skill-router
  - which skill
  - route skill
```

## methodology-selector contract

```yaml
contract:
  methodology: decision-matrix
  task: >
    Recommend exactly one INDEX-listed catalog skill for a required job using
    INDEX and SKILL.md fit evidence, or none when zero or multiple fit, or
    blocked when job/catalog is unusable; never recommend skill-router; never
    propose chains or execute the skill.
  audience: Agents unsure which catalog skill to run; humans checking the pick.
  context: >
    Catalog membership requires INDEX listing and skills/<name>/SKILL.md in the
    workspace. Ignore .skill-proposals and global installs. Hard gates before
    scoring: empty job or missing INDEX/skills root → blocked; apply exclude
    filter; remove skill-router from candidates. Criteria: (1) description /
    when-to-use positive fit to job, (2) when-not / boundaries negative fit,
    (3) single-responsibility match (hybrid jobs that need two skills → none).
    If zero remain or two+ tie for best → none with near_misses. Exactly one
    clear winner → skill + rationale citing catalog evidence. near_misses are
    evidence only — do not execute as a sequence.
  output_format: >
    YAML primary verdict skill|none|blocked with rationale, near_misses, or
    missing fields as applicable.
  validation:
    checks:
      - Primary verdict is exactly one of skill, none, blocked
      - Recommended names are in INDEX and have skills/<name>/SKILL.md
      - skill-router never selected
      - Ties and hybrids return none with near_misses, not an arbitrary winner
    evidence:
      - Returned YAML verdict
      - Catalog evidence cited for skill or near_misses
  method_fit:
    best_when: Several options must be compared using explicit criteria.
    avoid_when: Taste or one hard constraint determines the choice.
    reason: >
      Many catalog skills are options; fit uses explicit criteria and hard
      gates. Hard constraints (empty job, missing catalog, self-exclusion)
      apply directly without scoring; remaining choice is multi-option compare.
  human_review_stop:
    stop_conditions:
      - One primary verdict returned
      - Blocked when job or catalog unusable
    human_approval_required: true
    approval_actions:
      - ship skill to skills/
selection:
  methodology_name: Decision Matrix
  reason: >
    Dominant stage need is comparing catalog options with explicit criteria
    and visible tradeoffs, with hard gates for blocked/self-exclusion.
  deferred_method: none
  method_ref: references/decision-matrix.md
  quality_questions:
    - Were criteria chosen before scoring?
    - Are weights explained?
    - Does the recommendation match the scores?
    - Are close calls and caveats visible?
```

## skill-path-selector path

`methodology` — checklist complete, no name collision, single responsibility,
honest method fit `decision-matrix`.
