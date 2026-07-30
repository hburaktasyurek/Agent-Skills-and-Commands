# skill-composition smokes

Catalog for edge targets: `skills/INDEX.md` ∩ `skills/*/SKILL.md`.
Manner-only constraints (e.g. bare grill-me) are not forbids.

## S1 — skill-path-selector → composition_ok

**input:** `target: skill-path-selector`

**extracted (observed):**

```yaml
subject: skills/skill-path-selector/SKILL.md
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

## S2 — skill-draft-ship → composition_ok

**input:** `target: skill-draft-ship`

**extracted (observed):**

```yaml
subject: skills/skill-draft-ship/SKILL.md
invokes:
  - methodology-skill-creator
forbids:
  - skill-brief
  - skill-path-selector
  - methodology-selector
  - skill-review
  - skill-composition
  - loop-orchestrator
requires: []
```

**verdict:** `composition_ok`
**result:** pass

## S3 — skill-design-loop → composition_ok

**input:** `target: skill-design-loop`

**extracted (observed):**

```yaml
subject: skills/skill-design-loop/SKILL.md
invokes:
  - skill-brief
  - skill-path-selector
  - skill-draft-ship
forbids:
  - loop-orchestrator
  - skill-review
  - skill-composition
requires:
  - skill-brief
  - grill-me
  - skill-path-selector
  - methodology-selector
  - skill-draft-ship
  - methodology-skill-creator
# notes: grill-me is a nested skill-brief capability, not a direct invoke.
```

**verdict:** `composition_ok`
**result:** pass

## S4 — missing input → blocked

**input:** (empty)

```yaml
verdict: blocked
missing:
  - exactly one of target, proposal_path, or fixture_path
```

**result:** pass

## S5 — bad fixture → composition_fail

**input:** `fixture_path: skills/lifecycle-build/fixtures/bad-composition/SKILL.md`

```yaml
subject: skills/lifecycle-build/fixtures/bad-composition/SKILL.md
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
