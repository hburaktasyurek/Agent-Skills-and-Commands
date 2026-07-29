# skill-router smokes (S1–S3)

Catalog SoT at run time: `skills/INDEX.md` ∩ `skills/*/SKILL.md` in this workspace.
`skill-router` excluded from candidates. Primary verdict only checked.

## S1 Match

**job:** `Investigate a bug, find root cause, and file a GitHub issue with a TDD-based fix plan.`

**expected:** `skill: triage-issue`

**observed:**

```yaml
verdict: skill
skill: triage-issue
rationale: >
  INDEX and triage-issue description match investigate bug / root cause /
  GitHub issue / TDD-based fix plan; no second skill shares that full job
  without stretching.
```

**result:** pass

## S2 None (hybrid / tie)

**job:** `Review this and fix whatever is wrong.` (no artifact type)

**expected:** `none`

**observed:**

```yaml
verdict: none
near_misses:
  - skill: adversarial-spec-review
    why: Fits plan/spec red-team review, but job also demands fixing and names no spec.
  - skill: adversarial-diff-review
    why: Fits implementation diff review, but job also demands fixing and names no diff/PR.
  - skill: review-implementation
    why: Spec-vs-implementation audit, not a vague review+fix without artifacts.
  - skill: senior-implementer
    why: Implements from an approved spec; job asks review first and supplies none.
near_misses_note: Evidence only — do not execute as a sequence.
```

**result:** pass

## S3 Blocked

**job:** `   ` (whitespace only)

**expected:** `blocked`

**observed:**

```yaml
verdict: blocked
missing:
  - job: non-empty natural-language job description
```

**result:** pass
