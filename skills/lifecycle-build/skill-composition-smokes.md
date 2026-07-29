# skill-composition smokes (S1–S4)

Catalog for edge targets: `skills/INDEX.md` ∩ `skills/*/SKILL.md`.
Manner-only constraints (e.g. bare grill-me) are not forbids.

## S1 — skill-path-selector → composition_ok

**input:** `target: skill-path-selector`

**extracted (observed):**

```yaml
invokes:
  - skill-brief
  - methodology-selector
forbids: []
requires: []
# notes: parenthetical "may use grill-me" is not an invoke (nested capability);
# "bare grill-me" is manner-only, not a forbid.
```

**verdict:** `composition_ok`
**result:** pass

## S2 — skill-creator → composition_ok

**input:** `target: skill-creator`

**extracted (observed):**

```yaml
invokes:
  - methodology-skill-creator
  - loop-orchestrator
forbids:
  - skill-path-selector
  - skill-review
requires: []
# notes: "Require skill-path-selector path" is an artifact prerequisite, not
# requires:skill-path-selector; "Stop for skill-review" is a handoff, not invoke.
```

**verdict:** `composition_ok`
**result:** pass

## S3 — missing input → blocked

**input:** (empty)

```yaml
verdict: blocked
missing:
  - exactly one of target, proposal_path, or fixture_path
```

**result:** pass

## S4 — bad fixture → composition_fail

**input:** `fixture_path: skills/lifecycle-build/fixtures/bad-composition/SKILL.md`

```yaml
verdict: composition_fail
invokes:
  - not-a-real-skill-xyz
findings:
  - id: F1
    rule: 1
    quote: "Run `not-a-real-skill-xyz` before finishing."
    remedy: "Remove the invoke or add a real INDEX-listed skill."
```

**result:** pass
