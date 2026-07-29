# Plan adversarial review (restart)

Artifact: SMART skill design lifecycle restart plan (attached in session).
Plan file not modified (user freeze). Resolutions applied in implementation.

## Verdict

No open P0. P1s resolved below without editing the plan text.

## Findings

```
[P1] Bootstrap circularity for purpose review
Mechanism: skill-review does not exist until shipped; early drafts need review.
Resolution (implement): Use Observable purpose_pass questions as temporary
separate-session checklist until skill-review ships; then use the skill.

[P1] skill-creator purpose may look hybrid (draft + ship)
Mechanism: Two modes in one package risk decompose.
Resolution (implement): Frame eight-field task as one controlled persist/ship
procedure; if methodology-selector returns hybrid none→decompose, escalate and
do not ship a fat skill. Expectation: procedural none is legitimate.

[P1] Order proof vs gitignored drafts
Mechanism: Selection must exist before SKILL.md; .skill-proposals is gitignored.
Resolution (implement): Write tracked selection records under
skills/lifecycle-build/selections/ before any package SKILL.md is authored.
```

## Coverage

Attacked: hard rule order, bootstrap, hybrid creator, measurable order proof,
anti-pattern regression, ship atomicity (inherited from prior freeze).
