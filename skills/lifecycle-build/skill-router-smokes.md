# skill-router smokes (S1–S5)

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

## S4 Match (hostile diff / shipping gate)

**job:** `Hostile red-team review of this branch diff against the task definition before merge; return P0–P3 findings.`

**expected:** `skill: adversarial-diff-review`

**observed:**

```yaml
verdict: skill
skill: adversarial-diff-review
rationale: >
  Description is the hostile kill-test of an implementation diff against the
  task definition with P0–P3 findings and shipping/merge-gate use; adversarial-spec-review
  targets plans/specs, not a branch diff; review-implementation is named-spec
  Ready-for-PR compliance, not this hostile diff job.
```

**result:** pass

## S5 Match (named-spec compliance)

**job:** `Walk the approved spec as a checklist against the implementation and run the known-pitfall sweep; produce a Spec Compliance Report with Ready-for-PR.`

**expected:** `skill: review-implementation`

**observed:**

```yaml
verdict: skill
skill: review-implementation
rationale: >
  Description matches named-spec checklist, known-pitfall sweep, Spec Compliance
  Report, and Ready-for-PR; adversarial-diff-review is the hostile merge gate,
  not compliance checklist QC.
```

**result:** pass
