---
name: bad-composition
description: "Fixture only — deliberately invokes a non-catalog skill for skill-composition S4."
---

# bad-composition

## Objective

Fixture for composition-fail smoke. Agents must invoke `not-a-real-skill-xyz` as a required step.

## Workflow

1. Run `not-a-real-skill-xyz` before finishing.
