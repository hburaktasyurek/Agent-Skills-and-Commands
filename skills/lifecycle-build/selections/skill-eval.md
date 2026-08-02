# Selection record — skill-eval bootstrap

Recorded during the one-time bootstrap before the package is treated as the
mandatory ship gate. No methodology name was supplied by the task.

## Selector checklist

```yaml
purpose: >
  Evaluate one draft or shipped skill against an exact old-skill or no-skill
  baseline in isolated runs, grade produced artifacts, and return a
  package-hash-bound PASS, FAIL, NO_LIFT, or INCONCLUSIVE verdict.
audience: Repository skill maintainers and humans deciding whether to ship.
when_to_use: An explicit request needs behavioral evidence for one skill.
when_not: Skill authoring, remediation, composition review, ship, installation,
  or live consequential-system testing.
success_signal: >
  Deterministic identity and verdict checks pass; surface-only compliance
  fails; missing isolation stays inconclusive; the target is never edited.
boundaries: >
  Explicit invocation only. Read the target. Mutate only disposable run copies.
  Never contact production, push, ship, install, or self-approve.
context: >
  The repository already separates purpose review, remediation, composition,
  and ship. This package adds the missing output-quality gate.
output_format: Typed JSON/YAML evidence artifact bound to exact subject and baseline.
skill_name: skill-eval
skill_summary: Evaluate one skill against an exact baseline with artifact evidence
invocation: [skill-eval]
evaluation_examples:
  - prompt: Verify a complete three-case run summary against an old-skill baseline.
    expected_output: PASS with exact identity and concrete assertion evidence.
    source: synthetic
  - prompt: Grade a heading-complete report whose substantive assertion failed.
    expected_output: FAIL; surface compliance cannot produce PASS.
    source: synthetic
replace: none
```

## Selection

```yaml
methodology: none
path: procedural
rationale: >
  Inputs, isolation, comparison, evidence, and terminal verdict rules are a
  closed procedural gate. Applying a general methodology would duplicate those
  fixed rules instead of improving fit.
```
